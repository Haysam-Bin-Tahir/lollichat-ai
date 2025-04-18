'use client';

import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SubscriptionPlan, UserSubscription } from '@/lib/db/schema';
import { PaymentModal } from './payment-modal';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

type PlanCardProps = {
  plan: SubscriptionPlan;
  activeSubscription?: UserSubscription | null;
  onSubscribe?: () => void;
  isActive?: boolean;
  isBasicPlanActive?: boolean;
};

export function PlanCard({
  plan,
  activeSubscription,
  onSubscribe,
  isActive = false,
  isBasicPlanActive = false,
}: PlanCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isActiveSubscription =
    activeSubscription?.planId === plan.id &&
    activeSubscription?.status === 'active';
  const isPriority = plan.name === 'Priority';
  const isStandard = plan.name === 'Standard';
  const isFree = plan.name === 'Basic';

  const markActive = isActive || (isBasicPlanActive && plan.name === 'Basic');

  // Define features based on plan type
  const getFeatures = () => {
    const baseFeatures = [
      {
        feature: 'AI-powered conversations',
        included: true,
      },
    ];

    if (isFree) {
      return [
        ...baseFeatures,
        {
          feature: '5 saved chat conversations',
          included: true,
        },
        {
          feature: '5 messages per chat',
          included: true,
        },
        {
          feature: 'Update chat visibility',
          included: false,
        },
        {
          feature: 'Share chats publicly',
          included: false,
        },
        {
          feature: 'Access to Topics Library',
          included: false,
        },
        {
          feature: 'Text-to-Speech capability',
          included: false,
        },
      ];
    }

    if (isStandard) {
      return [
        ...baseFeatures,
        {
          feature: '30 saved chat conversations',
          included: true,
        },
        {
          feature: 'Unlimited messages per chat',
          included: true,
        },
        {
          feature: 'Update chat visibility',
          included: true,
        },
        {
          feature: 'Share chats publicly',
          included: true,
        },
        {
          feature: 'Access to Topics Library',
          included: true,
        },
        {
          feature: 'Text-to-Speech capability',
          included: false,
        },
      ];
    }

    // Priority plan
    return [
      ...baseFeatures,
      {
        feature: 'Unlimited saved conversations',
        included: true,
      },
      {
        feature: 'Unlimited messages per chat',
        included: true,
      },
      {
        feature: 'Update chat visibility',
        included: true,
      },
      {
        feature: 'Share chats publicly',
        included: true,
      },
      {
        feature: 'Access to Topics Library',
        included: true,
      },
      {
        feature: 'Text-to-Speech capability',
        included: true,
        highlight: true,
      },
    ];
  };

  const features = getFeatures();

  return (
    <>
      <Card
        className={cn(
          'relative overflow-hidden flex flex-col h-full',
          markActive && 'border-primary border-2',
        )}
      >
        {markActive && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
            Current Plan
          </div>
        )}
        <CardHeader className={cn('pb-4', isPriority && 'bg-primary/5')}>
          {isPriority && (
            <div className="flex items-center text-primary mb-2">
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">MOST POPULAR</span>
            </div>
          )}
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
          <div className={plan.name === 'Basic' ? 'mt-4 pt-2' : 'mt-2'}>
            {plan.name !== 'Basic' && (
              <span className="text-3xl font-bold">
                {formatCurrency(Number(plan.price))}
              </span>
            )}
            {plan.name === 'Basic' ? (
              <span className="text-muted-foreground ml-1">Free</span>
            ) : (
              <span className="text-muted-foreground ml-1">/month</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                {feature.included ? (
                  <Check
                    className={cn(
                      'h-4 w-4 mr-2 mt-0.5',
                      feature.highlight ? 'text-primary' : 'text-green-500',
                    )}
                  />
                ) : (
                  <X className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    feature.included ? '' : 'text-muted-foreground',
                    feature.highlight ? 'font-medium text-primary' : '',
                  )}
                >
                  {feature.feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        {plan.name !== 'Basic' && (
          <CardFooter className="mt-auto pt-6">
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full"
              disabled={markActive}
              variant={
                isPriority ? 'default' : isStandard ? 'outline' : 'secondary'
              }
            >
              {markActive ? 'Current Plan' : 'Subscribe'}
            </Button>
          </CardFooter>
        )}
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={plan}
        onSuccess={() => {
          if (onSubscribe) onSubscribe();
        }}
      />
    </>
  );
}
