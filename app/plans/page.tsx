import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/app/(auth)/auth';
import { 
  getAllSubscriptionPlans, 
  getActiveSubscriptionForUser,
  getSubscriptionPlanById 
} from '@/lib/db/queries/subscription';
import { PlanSelector } from '@/components/subscription/plan-selector';
import type { Metadata } from 'next';
import { SubscriptionManagement } from '@/components/subscription/subscription-management';

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

  const plans = await getAllSubscriptionPlans();
  const activeSubscription = userId ? await getActiveSubscriptionForUser(userId) : null;
  const activePlan = activeSubscription ? await getSubscriptionPlanById(activeSubscription.planId) : null;

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

      <PlanSelector 
        plans={plans} 
        activeSubscription={activeSubscription} 
        activePlan={activePlan} 
      />

      <div className="mt-12 text-center text-sm text-muted-foreground w-full">
        <p>
          All plans include a secure payment process. Your card will be charged
          based on your selected billing cycle until you cancel. Subscriptions can be canceled at any time
          from your account settings.
        </p>
      </div>
    </div>
  );
}
