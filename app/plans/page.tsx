import Link from 'next/link';
import { auth } from '@/app/(auth)/auth';
import { PlanCard } from '@/components/subscription/plan-card';
import { SubscriptionManagement } from '@/components/subscription/subscription-management';
import {
  getAllSubscriptionPlans,
  getActiveSubscriptionForUser,
  getSubscriptionPlanById,
} from '@/lib/db/queries/subscription';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose a subscription plan that fits your needs',
};

export default async function PlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="text-muted-foreground">
            You need to be signed in to view subscription plans.
          </p>
        </div>
      </div>
    );
  }

  const [plans, activeSubscription] = await Promise.all([
    getAllSubscriptionPlans(),
    userId ? getActiveSubscriptionForUser(userId) : null,
  ]);

  let activePlan;
  if (activeSubscription) {
    activePlan = await getSubscriptionPlanById(activeSubscription.planId);
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="flex items-center text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">
        Subscription Plans
      </h1>

      {activeSubscription && activePlan && (
        <SubscriptionManagement
          subscription={activeSubscription}
          plan={activePlan}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={activePlan?.id === plan.id}
          />
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground w-full">
        <p>
          All plans include a secure payment process. Your card will be charged
          monthly until you cancel. Subscriptions can be canceled at any time
          from your account settings.
        </p>
      </div>
    </div>
  );
}
