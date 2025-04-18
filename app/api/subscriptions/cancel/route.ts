import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getActiveSubscriptionForUser,
  updateSubscriptionStatus,
} from '@/lib/db/queries/subscription';
import { cancelSubscription as cancelAuthorizeNetSubscription } from '@/lib/services/authorize-net';

// POST /api/subscriptions/cancel - Cancel active subscription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active subscription
    const activeSubscription = await getActiveSubscriptionForUser(
      session.user.id,
    );

    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 },
      );
    }

    // Cancel subscription in Authorize.Net
    if (activeSubscription.authorizeNetSubscriptionId) {
      try {
        await cancelAuthorizeNetSubscription(
          activeSubscription.authorizeNetSubscriptionId,
        );
      } catch (error) {
        console.error('Error canceling subscription in Authorize.Net:', error);
        return NextResponse.json(
          { error: 'Failed to cancel subscription with payment processor' },
          { status: 500 },
        );
      }
    }

    // Update subscription status
    await updateSubscriptionStatus({
      id: activeSubscription.id,
      status: 'canceled',
      endDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 },
    );
  }
}
