import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import {
  getSubscriptionPlanById,
  createSubscription,
  createPaymentTransaction,
  updatePaymentTransactionStatus,
  getActiveSubscriptionForUser,
  updateSubscriptionStatus,
} from '@/lib/db/queries/subscription';
import {
  validatePaymentMethod,
  voidTransaction,
  createCustomerProfile,
  createSubscription as createAuthorizeNetSubscription,
  cancelSubscription as cancelAuthorizeNetSubscription,
} from '@/lib/services/authorize-net';

// Validation schema for subscription request
const subscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    cardNumber: z.string().regex(/^\d{13,19}$/),
    expirationMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expirationYear: z.string().regex(/^\d{4}$/),
    cardCode: z.string().regex(/^\d{3,4}$/),
  }),
});

// POST /api/subscriptions/subscribe - Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    console.log('Starting subscription process');
    const session = await auth();

    if (!session || !session.user) {
      console.log('Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', session.user.email);

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));

    try {
      subscriptionSchema.parse(body);
    } catch (error) {
      console.log('Validation error:', error);
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 },
      );
    }

    const { planId, paymentInfo } = body;
    console.log('Plan ID:', planId);

    // Get plan details
    const plan = await getSubscriptionPlanById(planId);
    if (!plan) {
      console.log('Plan not found:', planId);
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 },
      );
    }
    console.log('Plan found:', plan.name);

    // Check if user already has an active subscription
    const activeSubscription = await getActiveSubscriptionForUser(
      session.user.id || '',
    );

    // If user has an active subscription, handle plan change
    if (activeSubscription) {
      console.log('User has an active subscription, handling plan change');

      // Don't allow downgrading to the same plan
      if (activeSubscription.planId === planId) {
        console.log('User already subscribed to this plan');
        return NextResponse.json(
          { error: 'You are already subscribed to this plan' },
          { status: 400 },
        );
      }

      // Cancel the existing subscription in Authorize.Net
      if (activeSubscription.authorizeNetSubscriptionId) {
        try {
          console.log('Canceling existing subscription in Authorize.Net');
          await cancelAuthorizeNetSubscription(
            activeSubscription.authorizeNetSubscriptionId,
          );
          console.log('Existing subscription canceled in Authorize.Net');
        } catch (error) {
          console.error('Failed to cancel existing subscription:', error);
          // Continue anyway - we'll mark it as canceled in our database
        }
      }

      // Mark the existing subscription as canceled in our database
      await updateSubscriptionStatus({
        id: activeSubscription.id,
        status: 'canceled',
      });
      console.log('Existing subscription marked as canceled in database');
    }

    // Continue with the normal subscription process
    console.log('Validating payment method...');
    // Validate payment method with a $0 authorization
    let authTransactionId: any;
    try {
      authTransactionId = await validatePaymentMethod(
        paymentInfo.cardNumber,
        `${paymentInfo.expirationYear}-${paymentInfo.expirationMonth}`,
        paymentInfo.cardCode,
        paymentInfo.firstName,
        paymentInfo.lastName,
      );
      console.log(
        'Payment method validated, transaction ID:',
        authTransactionId,
      );
    } catch (error) {
      console.error('Payment validation failed:', error);
      return NextResponse.json(
        { error: `Payment validation failed: ${(error as any).message}` },
        { status: 400 },
      );
    }

    // Create payment transaction record (pending)
    console.log('Creating payment transaction record...');
    const transactionId = await createPaymentTransaction({
      userId: session.user.id || '',
      amount: Number(plan.price),
      status: 'pending',
    });
    console.log('Payment transaction created, ID:', transactionId);

    // Create customer profile in Authorize.Net
    console.log('Creating customer profile...');
    let customerProfileId: any;
    let customerPaymentProfileId: any;
    try {
      const customerProfile = await createCustomerProfile(
        session.user.email || '',
        paymentInfo.firstName,
        paymentInfo.lastName,
        paymentInfo.cardNumber,
        `${paymentInfo.expirationYear}-${paymentInfo.expirationMonth}`,
        paymentInfo.cardCode,
      );

      customerProfileId = customerProfile.customerProfileId;
      customerPaymentProfileId = customerProfile.customerPaymentProfileId;
      console.log('Customer profile created:', customerProfileId);
    } catch (error) {
      console.error('Failed to create customer profile:', error);

      // Update transaction status to failed
      await updatePaymentTransactionStatus({
        id: transactionId,
        status: 'failed',
      });

      // Void the authorization if it exists
      if (authTransactionId) {
        try {
          await voidTransaction(authTransactionId);
        } catch (voidError) {
          console.error('Failed to void transaction:', voidError);
        }
      }

      return NextResponse.json(
        {
          error: `Failed to create customer profile: ${(error as any).message}`,
        },
        { status: 500 },
      );
    }

    // Create subscription in Authorize.Net
    console.log('Creating subscription...');
    let subscriptionId: any;
    try {
      subscriptionId = await createAuthorizeNetSubscription(
        customerProfileId,
        customerPaymentProfileId,
        Number(plan.price),
        plan.name,
      );
      console.log('Subscription created:', subscriptionId);
    } catch (error) {
      console.error('Failed to create subscription:', error);

      // Update transaction status to failed
      await updatePaymentTransactionStatus({
        id: transactionId,
        status: 'failed',
      });

      // Void the authorization if it exists
      if (authTransactionId) {
        try {
          await voidTransaction(authTransactionId);
        } catch (voidError) {
          console.error('Failed to void transaction:', voidError);
        }
      }

      return NextResponse.json(
        { error: `Failed to create subscription: ${(error as any).message}` },
        { status: 500 },
      );
    }

    // If we got here, the subscription was created successfully
    console.log('Subscription process successful, updating records...');

    try {
      // Update transaction status to completed
      await updatePaymentTransactionStatus({
        id: transactionId,
        status: 'completed',
        authorizeNetTransactionId: authTransactionId,
      });

      // Create subscription record
      const startDate = new Date();
      const subscriptionRecordId = await createSubscription({
        userId: session.user.id || '',
        planId,
        status: 'active',
        authorizeNetSubscriptionId: subscriptionId,
        authorizeNetCustomerProfileId: customerProfileId,
        authorizeNetPaymentProfileId: customerPaymentProfileId,
        startDate,
      });

      console.log('Subscription record created:', subscriptionRecordId);

      return NextResponse.json({
        success: true,
        message: 'Subscription created successfully',
        subscriptionId: subscriptionRecordId,
      });
    } catch (error) {
      console.error('Failed to update records:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription records' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error processing subscription request:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription request' },
      { status: 500 },
    );
  }
}
