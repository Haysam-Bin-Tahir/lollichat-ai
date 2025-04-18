import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getSubscriptionById,
  updateSubscriptionStatus,
} from '@/lib/db/queries/subscription';
import { cancelSubscription as cancelAuthorizeNetSubscription } from '@/lib/services/authorize-net';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the ID from context.params (which is already resolved)
    const subscriptionId = context.params.id;

    // Get the subscription
    const subscription = await getSubscriptionById(subscriptionId);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    // Check if the subscription belongs to the user
    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if the subscription is already canceled
    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 },
      );
    }

    // Cancel the subscription in Authorize.Net
    if (subscription.authorizeNetSubscriptionId) {
      try {
        await cancelAuthorizeNetSubscription(
          subscription.authorizeNetSubscriptionId,
        );
      } catch (error) {
        console.error('Failed to cancel subscription in Authorize.Net:', error);
        // Continue anyway - we'll mark it as canceled in our database
      }
    }

    // Update the subscription status in the database
    await updateSubscriptionStatus({
      id: subscriptionId,
      status: 'canceled',
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
