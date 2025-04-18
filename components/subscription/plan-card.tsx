'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
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
};

export function PlanCard({
  plan,
  activeSubscription,
  onSubscribe,
  isActive = false,
}: PlanCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isActiveSubscription =
    activeSubscription?.planId === plan.id &&
    activeSubscription?.status === 'active';
  const isPriority = plan.name === 'Priority';

  const features = [
    'Access to all AI models',
    'Unlimited conversations',
    'Priority support',
    'Advanced features',
  ];

  return (
    <>
      <Card
        className={`relative overflow-hidden ${isActive ? 'border-primary border-2' : ''}`}
      >
        {isActive && (
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
          <div className="mt-2">
            <span className="text-3xl font-bold">
              {formatCurrency(Number(plan.price))}
            </span>
            <span className="text-muted-foreground ml-1">/month</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full"
            disabled={isActive}
          >
            {isActive ? 'Current Plan' : 'Subscribe'}
          </Button>
        </CardFooter>
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
