'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/db/schema';

const paymentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
  expirationMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month (MM)'),
  expirationYear: z.string().regex(/^\d{4}$/, 'Invalid year (YYYY)'),
  cardCode: z.string().regex(/^\d{3,4}$/, 'Invalid security code'),
});

type PaymentFormProps = {
  plan: SubscriptionPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PaymentForm({ plan, onSuccess, onCancel }: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cardCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const result = paymentSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path) {
          formattedErrors[error.path[0]] = error.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentInfo: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || 'Failed to process payment',
        );
      }

      toast.success('Subscription created successfully!');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              disabled={isSubmitting}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={isSubmitting}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="4111111111111111"
            disabled={isSubmitting}
            className={errors.cardNumber ? 'border-red-500' : ''}
          />
          {errors.cardNumber && (
            <p className="text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expirationMonth">Month (MM)</Label>
            <Input
              id="expirationMonth"
              name="expirationMonth"
              value={formData.expirationMonth}
              onChange={handleChange}
              placeholder="01"
              maxLength={2}
              disabled={isSubmitting}
              className={errors.expirationMonth ? 'border-red-500' : ''}
            />
            {errors.expirationMonth && (
              <p className="text-sm text-red-500">{errors.expirationMonth}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expirationYear">Year (YYYY)</Label>
            <Input
              id="expirationYear"
              name="expirationYear"
              value={formData.expirationYear}
              onChange={handleChange}
              placeholder="2025"
              maxLength={4}
              disabled={isSubmitting}
              className={errors.expirationYear ? 'border-red-500' : ''}
            />
            {errors.expirationYear && (
              <p className="text-sm text-red-500">{errors.expirationYear}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCode">CVV</Label>
            <Input
              id="cardCode"
              name="cardCode"
              value={formData.cardCode}
              onChange={handleChange}
              placeholder="123"
              maxLength={4}
              disabled={isSubmitting}
              className={errors.cardCode ? 'border-red-500' : ''}
            />
            {errors.cardCode && (
              <p className="text-sm text-red-500">{errors.cardCode}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe for $${Number(plan.price).toFixed(2)}/month`
          )}
        </Button>
      </div>
    </form>
  );
}
