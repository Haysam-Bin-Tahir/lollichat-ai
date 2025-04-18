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

type PlanCardProps = {
  plan: SubscriptionPlan;
  activeSubscription?: UserSubscription | null;
  onSubscribe?: () => void;
};

export function PlanCard({
  plan,
  activeSubscription,
  onSubscribe,
}: PlanCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isActive =
    activeSubscription?.planId === plan.id &&
    activeSubscription?.status === 'active';
  const isPriority = plan.name === 'Priority';

  return (
    <>
      <Card
        className={cn(
          'flex flex-col h-full transition-all duration-200',
          isPriority && 'border-primary shadow-md',
          isActive && 'ring-2 ring-primary',
        )}
      >
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
              ${Number(plan.price).toFixed(2)}
            </span>
            <span className="text-muted-foreground ml-1">/month</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isActive ? (
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          ) : (
            <Button
              className="w-full"
              variant={isPriority ? 'default' : 'outline'}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Subscribe
            </Button>
          )}
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
