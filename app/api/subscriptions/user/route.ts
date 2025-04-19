import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getActiveSubscriptionForUser,
  getAllSubscriptionsForUser,
} from '@/lib/db/queries/subscription';

// GET /api/subscriptions/user - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSubscription = await getActiveSubscriptionForUser(
      session.user.id || '',
    );
    const allSubscriptions = await getAllSubscriptionsForUser(
      session.user.id || '',
    );

    return NextResponse.json({
      activeSubscription,
      allSubscriptions,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscriptions' },
      { status: 500 },
    );
  }
}
