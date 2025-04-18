'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { SubscriptionPlan, UserSubscription } from '@/lib/db/schema';

type SubscriptionStatus = 'loading' | 'active' | 'inactive' | 'error';

interface UseSubscriptionReturn {
  isLoading: boolean;
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  isSubscribed: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      setStatus('inactive');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        '/api/subscriptions?includeUserSubscriptions=true',
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }

      const data = await response.json();

      if (data.activeSubscription && data.activePlan) {
        setSubscription(data.activeSubscription);
        setPlan(data.activePlan);
        setStatus('active');
      } else {
        setSubscription(null);
        setPlan(null);
        setStatus('inactive');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [session, sessionStatus]);

  return {
    isLoading,
    subscription,
    plan,
    status,
    isSubscribed: status === 'active',
    refetch: fetchSubscription,
  };
}

// Helper function to check if a feature is available based on subscription
export function useFeatureAccess(featureName: string): {
  hasAccess: boolean;
  isLoading: boolean;
} {
  const { isLoading, plan, isSubscribed } = useSubscription();

  // Define feature access rules
  const featureAccess: Record<string, string[]> = {
    'advanced-models': ['pro', 'business'],
    'unlimited-messages': ['standard', 'priority'], // Only standard and priority tiers
    'file-upload': ['pro', 'business'],
    'priority-support': ['business'],
    'team-collaboration': ['business'],
    'topics-access': ['standard', 'priority'], // Add topics access feature
    'public-chats': ['standard', 'priority'], // Add public chats feature
  };

  const hasAccess = () => {
    if (!isSubscribed || !plan) return false;

    // If the feature doesn't have specific requirements, it's available to all
    if (!featureAccess[featureName]) return true;

    // Check if the current plan has access to this feature
    return featureAccess[featureName].includes(plan.name.toLowerCase());
  };

  return {
    hasAccess: hasAccess(),
    isLoading,
  };
}

// Define feature limits
const featureLimits: Record<string, Record<string, number>> = {
  'chat-history': {
    free: 5,
    standard: 30,
    priority: Infinity,
  },
  topics: {
    free: 0,
    standard: 5,
    priority: Infinity,
  },
};

// Add a function to get feature limits
export function useFeatureLimit(featureName: string): {
  limit: number;
  isLoading: boolean;
} {
  const { isLoading, plan, isSubscribed } = useSubscription();

  const getLimit = () => {
    if (!featureLimits[featureName]) {
      return Infinity; // No limit defined
    }

    if (!isSubscribed || !plan) {
      return featureLimits[featureName]['free'] || 0;
    }

    const planName = plan.name.toLowerCase();
    return (
      featureLimits[featureName][planName] ||
      featureLimits[featureName]['free'] ||
      0
    );
  };

  return {
    limit: getLimit(),
    isLoading,
  };
}
