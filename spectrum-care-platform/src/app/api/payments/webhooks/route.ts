import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { StripeService } from '@/services/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({
        success: false,
        message: 'Missing signature'
      }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = StripeService.constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed'
    }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Get user ID from metadata or customer
    let userId = subscription.metadata.userId;

    if (!userId) {
      // Try to get user from customer metadata
      const customerResult = await db.query(`
        SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1 LIMIT 1
      `, [customerId]);

      if (customerResult.rows.length > 0) {
        userId = customerResult.rows[0].user_id;
      }
    }

    if (!userId) {
      console.error('Could not determine user for subscription:', subscription.id);
      return;
    }

    // Update or create subscription record
    await db.query(`
      INSERT INTO subscriptions (
        user_id, stripe_subscription_id, stripe_customer_id,
        plan_type, status, current_period_start, current_period_end,
        trial_end, monthly_price, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (stripe_subscription_id)
      DO UPDATE SET
        status = $5,
        current_period_start = $6,
        current_period_end = $7,
        trial_end = $8,
        updated_at = NOW()
    `, [
      userId,
      subscription.id,
      customerId,
      subscription.metadata.planId || 'unknown',
      subscription.status.toUpperCase(),
      new Date((subscription as any).current_period_start * 1000),
      new Date((subscription as any).current_period_end * 1000),
      (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
      subscription.items.data[0]?.price?.unit_amount || 0
    ]);

    console.log(`Subscription ${subscription.id} updated for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    await db.query(`
      UPDATE subscriptions
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    console.log(`Subscription ${subscription.id} cancelled`);

  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    const customerId = invoice.customer as string;
    const amount = invoice.amount_paid || 0;

    // Get subscription to find user
    const subscriptionResult = await db.query(`
      SELECT id, user_id FROM subscriptions
      WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2
      LIMIT 1
    `, [subscriptionId, customerId]);

    if (subscriptionResult.rows.length === 0) {
      console.error('Could not find subscription for payment:', invoice.id);
      return;
    }

    const { id: subId, user_id: userId } = subscriptionResult.rows[0];

    // Record payment in payment history
    await db.query(`
      INSERT INTO payment_history (
        user_id, subscription_id, stripe_payment_intent_id,
        amount, currency, status, payment_date, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, 'succeeded', NOW(), $6, $7)
    `, [
      userId,
      subId,
      typeof (invoice as any).payment_intent === 'string' ? (invoice as any).payment_intent : null,
      amount,
      invoice.currency.toUpperCase(),
      invoice.description || 'Subscription payment',
      JSON.stringify({
        invoiceId: invoice.id,
        subscriptionId
      })
    ]);

    // Update subscription status to active if it was past due
    await db.query(`
      UPDATE subscriptions
      SET status = 'ACTIVE', updated_at = NOW()
      WHERE id = $1 AND status = 'PAST_DUE'
    `, [subId]);

    console.log(`Payment succeeded for invoice ${invoice.id}, amount: ${amount}`);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    const customerId = invoice.customer as string;

    // Get subscription to find user
    const subscriptionResult = await db.query(`
      SELECT id, user_id FROM subscriptions
      WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2
      LIMIT 1
    `, [subscriptionId, customerId]);

    if (subscriptionResult.rows.length === 0) {
      console.error('Could not find subscription for failed payment:', invoice.id);
      return;
    }

    const { id: subId, user_id: userId } = subscriptionResult.rows[0];

    // Record failed payment
    await db.query(`
      INSERT INTO payment_history (
        user_id, subscription_id, stripe_payment_intent_id,
        amount, currency, status, payment_date, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, 'failed', NOW(), $6, $7)
    `, [
      userId,
      subId,
      typeof (invoice as any).payment_intent === 'string' ? (invoice as any).payment_intent : null,
      invoice.amount_due || 0,
      invoice.currency.toUpperCase(),
      invoice.description || 'Subscription payment failed',
      JSON.stringify({
        invoiceId: invoice.id,
        subscriptionId,
        attemptCount: invoice.attempt_count || 1
      })
    ]);

    // Update subscription status
    await db.query(`
      UPDATE subscriptions
      SET status = 'PAST_DUE', updated_at = NOW()
      WHERE id = $1
    `, [subId]);

    // Create notification for user
    await db.query(`
      INSERT INTO notifications (
        user_id, title, message, notification_type, created_at
      ) VALUES ($1, $2, $3, 'PAYMENT_FAILED', NOW())
    `, [
      userId,
      'Payment Failed',
      'Your subscription payment failed. Please update your payment method to continue service.'
    ]);

    console.log(`Payment failed for invoice ${invoice.id}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Get user for notification
    const userResult = await db.query(`
      SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1 LIMIT 1
    `, [customerId]);

    if (userResult.rows.length === 0) {
      console.error('Could not find user for trial ending:', subscription.id);
      return;
    }

    const userId = userResult.rows[0].user_id;

    // Create notification
    await db.query(`
      INSERT INTO notifications (
        user_id, title, message, notification_type, created_at
      ) VALUES ($1, $2, $3, 'TRIAL_ENDING', NOW())
    `, [
      userId,
      'Trial Ending Soon',
      'Your free trial will end in 3 days. Add a payment method to continue using SpectrumCare.'
    ]);

    console.log(`Trial ending notification sent for subscription ${subscription.id}`);

  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    const customerId = paymentMethod.customer as string;

    if (!customerId) {
      return;
    }

    // Get user for notification
    const userResult = await db.query(`
      SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1 LIMIT 1
    `, [customerId]);

    if (userResult.rows.length === 0) {
      return;
    }

    const userId = userResult.rows[0].user_id;

    // Create notification
    await db.query(`
      INSERT INTO notifications (
        user_id, title, message, notification_type, created_at
      ) VALUES ($1, $2, $3, 'PAYMENT_METHOD_ADDED', NOW())
    `, [
      userId,
      'Payment Method Added',
      'A new payment method has been added to your account.'
    ]);

    console.log(`Payment method attached for customer ${customerId}`);

  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}
