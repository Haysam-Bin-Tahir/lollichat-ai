import { auth } from '@/app/(auth)/auth';
import { PlanCard } from '@/components/subscription/plan-card';
import { CurrentSubscription } from '@/components/subscription/current-subscription';
import {
  getAllSubscriptionPlans,
  getActiveSubscriptionForUser,
} from '@/lib/db/queries/subscription';
import { getSubscriptionPlanById } from '@/lib/db/queries/subscription';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose a subscription plan that fits your needs',
};

export default async function PlansPage() {
  const session = await auth();

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
    session.user.id ? getActiveSubscriptionForUser(session.user.id) : null,
  ]);

  let activePlan;
  if (activeSubscription) {
    activePlan = await getSubscriptionPlanById(activeSubscription.planId);
  }

  return (
    <div className="container max-w-6xl py-12 px-4 sm:px-6 flex flex-col items-center mx-auto">
      <div className="text-center mb-12 w-full">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a subscription plan that best fits your needs. Upgrade or
          downgrade at any time.
        </p>
      </div>

      {activeSubscription && activePlan && (
        <div className="mb-12 w-full max-w-md">
          <CurrentSubscription
            subscription={activeSubscription}
            plan={activePlan}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            activeSubscription={activeSubscription}
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
