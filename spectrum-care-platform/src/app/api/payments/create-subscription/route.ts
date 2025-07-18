import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { StripeService, SUBSCRIPTION_PLANS, PlanId } from '@/services/stripe';

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const body = await request.json();
    const { planId, paymentMethodId, trialDays = 14 } = body;

    // Validate plan
    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid plan selected'
      }, { status: 400 });
    }

    const selectedPlan = SUBSCRIPTION_PLANS[planId as PlanId];

    // Check if user's role can access this plan
    const availablePlans = StripeService.getPlansByRole(user.role);
    if (!availablePlans.some(plan => plan.id === planId)) {
      return NextResponse.json({
        success: false,
        message: 'Plan not available for your account type'
      }, { status: 403 });
    }

    // Create Stripe customer
    const customer = await StripeService.createCustomer({
      email: user.email,
      name: `${user.profile_data?.firstName || 'User'} ${user.profile_data?.lastName || ''}`.trim(),
      metadata: {
        userId: user.id,
        role: user.role
      }
    });

    // Attach payment method if provided
    if (paymentMethodId) {
      await StripeService.attachPaymentMethod(paymentMethodId, customer.id);
      await StripeService.setDefaultPaymentMethod(customer.id, paymentMethodId);
    }

    // Create subscription
    const subscription = await StripeService.createSubscription({
      customerId: customer.id,
      priceId: selectedPlan.stripePriceId!,
      trialPeriodDays: trialDays,
      metadata: {
        userId: user.id,
        planId: selectedPlan.id
      }
    });

    // Create database record
    await db.query(`
      INSERT INTO subscriptions (
        user_id, stripe_subscription_id, stripe_customer_id,
        plan_type, status, current_period_start, current_period_end,
        trial_end, monthly_price, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [
      user.id,
      subscription.id,
      customer.id,
      selectedPlan.id,
      subscription.status.toUpperCase(),
      new Date((subscription as any).current_period_start * 1000),
      new Date((subscription as any).current_period_end * 1000),
      (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
      selectedPlan.price
    ]);

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        customerId: customer.id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        monthlyPrice: selectedPlan.price,
        trialDays: trialDays
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create subscription'
    }, { status: 500 });
  }
}
