import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getSubscriptionPlanById } from '@/lib/db/queries/subscription';

// GET /api/subscriptions/[id] - Get subscription plan by ID
export async function GET(request: NextRequest, { params }: any) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const plan = await getSubscriptionPlanById(id);

    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plan' },
      { status: 500 },
    );
  }
}
