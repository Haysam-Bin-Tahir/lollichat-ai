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

  const hasAccess = () => {
    if (isLoading) return false;

    // Define which plans have access to which features
    const featureAccess: Record<string, string[]> = {
      'advanced-models': ['standard', 'priority', 'enterprise'],
      'unlimited-messages': ['priority', 'enterprise'],
      'file-upload': ['priority', 'enterprise'],
      'priority-support': ['priority', 'enterprise'],
      'topics-access': ['standard', 'priority', 'enterprise'],
      'public-chats': ['priority', 'enterprise'],
      'text-to-speech': ['priority', 'enterprise'],
      'dedicated-support': ['enterprise'],
      'team-collaboration': ['enterprise'],
    };

    if (!isSubscribed || !plan) {
      return false;
    }

    const planName = plan.name.toLowerCase().replace(' yearly', '');
    return featureAccess[featureName]?.includes(planName) || false;
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
    priority: 100,
    enterprise: Infinity,
  },
  'topics': {
    free: 0,
    standard: 5,
    priority: 15,
    enterprise: Infinity,
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

    const basePlanName = plan.name.replace(' Yearly', '').toLowerCase();
    return (
      featureLimits[featureName][basePlanName] ||
      featureLimits[featureName]['free'] ||
      0
    );
  };

  return {
    limit: getLimit(),
    isLoading,
  };
}
