'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SubscriptionPlan } from '@/lib/db/schema';
import { PaymentForm } from './payment-form';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess?: () => void;
};

export function PaymentModal({
  isOpen,
  onClose,
  plan,
  onSuccess,
}: PaymentModalProps) {
  const isYearly = plan.name.includes('Yearly');
  const billingText = isYearly ? 'year' : 'month';
  
  // Calculate monthly equivalent for yearly plans
  const getMonthlyEquivalent = () => {
    if (!isYearly) return null;
    
    return (Number(plan.price) / 12).toFixed(2);
  };
  
  // Calculate savings for yearly plans
  const getSavings = () => {
    if (!isYearly) return null;
    
    const monthlyPrice = plan.name.includes('Standard') ? 19.99 :
                         plan.name.includes('Priority') ? 49.99 :
                         plan.name.includes('Enterprise') ? 99.99 : 0;
    
    return (monthlyPrice * 12 - Number(plan.price)).toFixed(2);
  };

  const monthlyEquivalent = getMonthlyEquivalent();
  const savings = getSavings();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name.replace(' Yearly', '')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2 border-b pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{plan.name.replace(' Yearly', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                ${Number(plan.price).toFixed(2)}/{billingText}
              </span>
            </div>
            {isYearly && savings && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Savings</span>
                <span>${savings}</span>
              </div>
            )}
            {isYearly && monthlyEquivalent && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Monthly equivalent</span>
                <span>${monthlyEquivalent}/month</span>
              </div>
            )}
          </div>
          <PaymentForm
            plan={plan}
            onSuccess={() => {
              onClose();
              if (onSuccess) onSuccess();
              // Refresh the page to update the UI
              window.location.reload();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
