'use client';

import { useState, useEffect } from 'react';
import { PlanCard } from '@/components/subscription/plan-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SubscriptionPlan, UserSubscription } from '@/lib/db/schema';

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  activeSubscription: UserSubscription | null;
  activePlan: SubscriptionPlan | null;
}

export function PlanSelector({ plans, activeSubscription, activePlan }: PlanSelectorProps) {
  // Determine the default billing cycle based on the active plan
  const getDefaultBillingCycle = () => {
    if (activePlan) {
      return activePlan.name.includes('Yearly') ? 'yearly' : 'monthly';
    }
    return 'monthly'; // Default to monthly if no active plan
  };

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    getDefaultBillingCycle()
  );

  // Filter plans based on billing cycle
  const filteredPlans = plans
    .filter(plan => {
      if (billingCycle === 'monthly') {
        return !plan.name.includes('Yearly');
      } else {
        // For yearly, only show yearly plans (not Basic)
        return plan.name.includes('Yearly');
      }
    })
    .sort((a, b) => Number(a.price) - Number(b.price));

  // Force a re-render when billing cycle changes to ensure layout is correct
  useEffect(() => {
    // This is just to trigger a re-render
  }, [billingCycle]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center mb-8">
        <Tabs 
          defaultValue={billingCycle}
          className="w-full max-w-md"
          onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Save up to 70%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="w-full md:w-[calc(33%-1.5rem)] max-w-sm">
            <PlanCard
              plan={plan}
              activeSubscription={activeSubscription}
              isActive={activePlan?.id === plan.id}
              isBasicPlanActive={!activePlan && plan.name === 'Basic'}
              billingCycle={billingCycle}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 