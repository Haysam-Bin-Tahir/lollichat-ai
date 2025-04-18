import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getAllSubscriptionPlans,
  getActiveSubscriptionForUser,
  getAllSubscriptionsForUser,
} from '@/lib/db/queries/subscription';

// GET /api/subscriptions - Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeUserSubscriptions =
      searchParams.get('includeUserSubscriptions') === 'true';

    // Get all subscription plans
    const plans = await getAllSubscriptionPlans();

    // If requested, include user's subscriptions
    if (includeUserSubscriptions) {
      const activeSubscription = await getActiveSubscriptionForUser(
        session.user.id,
      );
      const allSubscriptions = await getAllSubscriptionsForUser(
        session.user.id,
      );

      return NextResponse.json({
        plans,
        activeSubscription,
        allSubscriptions,
      });
    }

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 },
    );
  }
}
