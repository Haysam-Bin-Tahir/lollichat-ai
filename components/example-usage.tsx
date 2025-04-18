'use client';

import { useSubscription, useFeatureAccess } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function FeatureGatedComponent() {
  const { isSubscribed, plan, isLoading } = useSubscription();
  const { hasAccess: canUseAdvancedModels } =
    useFeatureAccess('advanced-models');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You need a subscription to access this feature.
        </p>
        <Button asChild>
          <a href="/plans">View Plans</a>
        </Button>
      </div>
    );
  }

  if (!canUseAdvancedModels) {
    return (
      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-2">Advanced Feature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your current plan ({plan?.name}) doesn't include this feature. Upgrade
          to access advanced models.
        </p>
        <Button asChild>
          <a href="/plans">Upgrade Plan</a>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Your feature content here */}
      <p>Advanced models are available with your {plan?.name} plan!</p>
    </div>
  );
}
