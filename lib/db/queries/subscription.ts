import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '@/lib/db/queries';
import {
  subscriptionPlan,
  userSubscription,
  paymentTransaction,
} from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';

// Get all subscription plans
export async function getAllSubscriptionPlans() {
  return db.select().from(subscriptionPlan).orderBy(subscriptionPlan.price);
}

// Get subscription plan by ID
export async function getSubscriptionPlanById(id: string) {
  const plans = await db
    .select()
    .from(subscriptionPlan)
    .where(eq(subscriptionPlan.id, id));
  return plans[0];
}

// Get active subscription for user
export async function getActiveSubscriptionForUser(userId: string) {
  const subscriptions = await db
    .select()
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.userId, userId),
        eq(userSubscription.status, 'active'),
      ),
    )
    .orderBy(desc(userSubscription.createdAt))
    .limit(1);

  return subscriptions[0];
}

// Get all subscriptions for user
export async function getAllSubscriptionsForUser(userId: string) {
  return db
    .select()
    .from(userSubscription)
    .where(eq(userSubscription.userId, userId))
    .orderBy(desc(userSubscription.createdAt));
}

// Create a new subscription
export async function createSubscription({
  userId,
  planId,
  status,
  authorizeNetSubscriptionId,
  authorizeNetCustomerProfileId,
  authorizeNetPaymentProfileId,
  startDate,
  endDate,
}: {
  userId: string;
  planId: string;
  status: string;
  authorizeNetSubscriptionId?: string;
  authorizeNetCustomerProfileId?: string;
  authorizeNetPaymentProfileId?: string;
  startDate: Date;
  endDate?: Date;
}) {
  const id = generateUUID();

  await db.insert(userSubscription).values({
    id,
    userId,
    planId,
    status,
    authorizeNetSubscriptionId,
    authorizeNetCustomerProfileId,
    authorizeNetPaymentProfileId,
    startDate,
    endDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

// Update subscription status
export async function updateSubscriptionStatus({
  id,
  status,
  endDate,
}: {
  id: string;
  status: string;
  endDate?: Date;
}) {
  await db
    .update(userSubscription)
    .set({
      status,
      endDate,
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.id, id));
}

// Create a payment transaction
export async function createPaymentTransaction({
  userId,
  subscriptionId,
  amount,
  currency,
  status,
  authorizeNetTransactionId,
}: {
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  status: string;
  authorizeNetTransactionId?: string;
}) {
  const id = generateUUID();

  await db.insert(paymentTransaction).values({
    id,
    userId,
    subscriptionId,
    amount,
    currency: currency || 'USD',
    status,
    authorizeNetTransactionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

// Update payment transaction status
export async function updatePaymentTransactionStatus({
  id,
  status,
  authorizeNetTransactionId,
}: {
  id: string;
  status: string;
  authorizeNetTransactionId?: string;
}) {
  await db
    .update(paymentTransaction)
    .set({
      status,
      authorizeNetTransactionId,
      updatedAt: new Date(),
    })
    .where(eq(paymentTransaction.id, id));
}

// Get payment transactions for user
export async function getPaymentTransactionsForUser(userId: string) {
  return db
    .select()
    .from(paymentTransaction)
    .where(eq(paymentTransaction.userId, userId))
    .orderBy(desc(paymentTransaction.createdAt));
}

// Get a subscription by ID
export async function getSubscriptionById(id: string) {
  try {
    const result = await db
      .select()
      .from(userSubscription)
      .where(eq(userSubscription.id, id))
      .limit(1);

    return result[0];
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    throw error;
  }
}
