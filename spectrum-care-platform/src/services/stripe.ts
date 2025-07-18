import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  PROFESSIONAL_BASIC: {
    id: 'prof_basic',
    name: 'Professional Basic',
    description: 'Essential tools for individual practitioners',
    price: 4900, // £49.00 per month
    currency: 'gbp',
    interval: 'month',
    features: [
      'Up to 50 clients',
      'Basic appointment scheduling',
      'Standard report templates',
      'Email support',
      'Basic analytics'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PROF_BASIC
  },
  PROFESSIONAL_PREMIUM: {
    id: 'prof_premium',
    name: 'Professional Premium',
    description: 'Advanced practice management for growing practices',
    price: 9900, // £99.00 per month
    currency: 'gbp',
    interval: 'month',
    features: [
      'Unlimited clients',
      'Advanced scheduling & calendar sync',
      'Custom report templates',
      'Priority support',
      'Advanced analytics & insights',
      'Team collaboration tools',
      'API access'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PROF_PREMIUM
  },
  PROFESSIONAL_ENTERPRISE: {
    id: 'prof_enterprise',
    name: 'Professional Enterprise',
    description: 'Complete solution for large practices and organizations',
    price: 19900, // £199.00 per month
    currency: 'gbp',
    interval: 'month',
    features: [
      'Everything in Premium',
      'Multi-location support',
      'Advanced integrations',
      'Custom branding',
      'Dedicated account manager',
      'Training & onboarding',
      'SLA guarantee'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PROF_ENTERPRISE
  },
  LA_AUTHORITY: {
    id: 'la_authority',
    name: 'Local Authority',
    description: 'Comprehensive SEND management for local authorities',
    price: 49900, // £499.00 per month
    currency: 'gbp',
    interval: 'month',
    features: [
      'Unlimited users and cases',
      'Advanced analytics dashboard',
      'Compliance reporting',
      'Budget management',
      'Team workload optimization',
      'Custom integrations',
      'Dedicated support team'
    ],
    stripePriceId: process.env.STRIPE_PRICE_LA_AUTHORITY
  }
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export class StripeService {
  // Create customer
  static async createCustomer(params: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata || {}
    });
  }

  // Create subscription
  static async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialPeriodDays,
      metadata: params.metadata || {},
      expand: ['latest_invoice.payment_intent']
    });
  }

  // Create setup intent for payment method
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session'
    });
  }

  // Create payment intent for one-time payment
  static async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true
      }
    });
  }

  // Update subscription
  static async updateSubscription(params: {
    subscriptionId: string;
    priceId?: string;
    quantity?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);

    const updateData: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata
    };

    if (params.priceId) {
      updateData.items = [{
        id: subscription.items.data[0].id,
        price: params.priceId,
        quantity: params.quantity || 1
      }];
    }

    return await stripe.subscriptions.update(params.subscriptionId, updateData);
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
  }

  // Get subscription
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer', 'items.data.price']
    });
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.latest_invoice', 'data.items.data.price']
    });
    return subscriptions.data;
  }

  // Get invoices for customer
  static async getCustomerInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.payment_intent']
    });
    return invoices.data;
  }

  // Create invoice
  static async createInvoice(params: {
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Invoice> {
    return await stripe.invoices.create({
      customer: params.customerId,
      description: params.description,
      metadata: params.metadata || {},
      auto_advance: true
    });
  }

  // Add invoice item
  static async addInvoiceItem(params: {
    customerId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.InvoiceItem> {
    return await stripe.invoiceItems.create({
      customer: params.customerId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      metadata: params.metadata || {}
    });
  }

  // Process refund
  static async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    return await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount,
      reason: params.reason,
      metadata: params.metadata || {}
    });
  }

  // Get payment methods for customer
  static async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    return paymentMethods.data;
  }

  // Attach payment method to customer
  static async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
  }

  // Set default payment method
  static async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  }

  // Construct webhook event
  static constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }

  // Get usage statistics
  static async getUsageStatistics(customerId: string): Promise<{
    totalSpent: number;
    currentPeriodSpent: number;
    invoiceCount: number;
    subscriptionCount: number;
  }> {
    const [invoices, subscriptions] = await Promise.all([
      stripe.invoices.list({ customer: customerId, limit: 100 }),
      stripe.subscriptions.list({ customer: customerId })
    ]);

    const totalSpent = invoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0);
    }, 0);

    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // First day of current month

    const currentPeriodSpent = invoices.data
      .filter(invoice => new Date(invoice.created * 1000) >= currentPeriodStart)
      .reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);

    return {
      totalSpent,
      currentPeriodSpent,
      invoiceCount: invoices.data.length,
      subscriptionCount: subscriptions.data.length
    };
  }

  // Calculate trial end date
  static calculateTrialEnd(days: number): Date {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + days);
    return trialEnd;
  }

  // Format amount for display
  static formatAmount(amount: number, currency = 'gbp'): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount / 100);
  }

  // Get plan by ID
  static getPlan(planId: PlanId) {
    return SUBSCRIPTION_PLANS[planId];
  }

  // Get all plans
  static getAllPlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  // Get plans by user role
  static getPlansByRole(role: string) {
    switch (role) {
      case 'PROFESSIONAL':
        return [
          SUBSCRIPTION_PLANS.PROFESSIONAL_BASIC,
          SUBSCRIPTION_PLANS.PROFESSIONAL_PREMIUM,
          SUBSCRIPTION_PLANS.PROFESSIONAL_ENTERPRISE
        ];
      case 'LA_OFFICER':
      case 'LA_MANAGER':
      case 'LA_EXECUTIVE':
        return [SUBSCRIPTION_PLANS.LA_AUTHORITY];
      default:
        return [];
    }
  }
}
