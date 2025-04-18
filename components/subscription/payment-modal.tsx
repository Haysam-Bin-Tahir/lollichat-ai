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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name} Plan</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                ${Number(plan.price).toFixed(2)}/month
              </span>
            </div>
          </div>
          <PaymentForm
            plan={plan}
            onSuccess={() => {
              onClose();
              if (onSuccess) onSuccess();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
