'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { SubscriptionPlan } from '@/lib/db/schema';

// Custom validation for expiration date
const expirationDateSchema = z
  .object({
    expirationMonth: z
      .string()
      .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month (MM)'),
    expirationYear: z.string().regex(/^\d{4}$/, 'Invalid year (YYYY)'),
  })
  .refine(
    (data) => {
      // Get current date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

      // Parse input values
      const year = Number.parseInt(data.expirationYear, 10);
      const month = Number.parseInt(data.expirationMonth, 10);

      // Check if date is in the future
      return (
        year > currentYear || (year === currentYear && month >= currentMonth)
      );
    },
    {
      message: 'Expiration date must be in the future',
      path: ['expirationDate'], // Use a custom path that doesn't match a field
    },
  );

const paymentSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
    expirationMonth: z
      .string()
      .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month (MM)'),
    expirationYear: z.string().regex(/^\d{4}$/, 'Invalid year (YYYY)'),
    cardCode: z.string().regex(/^\d{3,4}$/, 'Invalid security code'),
  })
  .superRefine((data, ctx) => {
    // Validate expiration date
    const expirationResult = expirationDateSchema.safeParse({
      expirationMonth: data.expirationMonth,
      expirationYear: data.expirationYear,
    });

    if (!expirationResult.success) {
      const error = expirationResult.error.errors[0];

      // If it's the custom expiration date error, add it to both fields
      if (error.path[0] === 'expirationDate') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
          path: ['expirationMonth'],
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
          path: ['expirationYear'],
        });
      } else {
        // Otherwise, pass through the original error
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
          path: [error.path[0]],
        });
      }
    }
  });

type PaymentFormProps = {
  plan: SubscriptionPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
};

// Format credit card number in chunks of 4
const formatCreditCardNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Split into chunks of 4 and join with spaces
  const chunks = [];
  for (let i = 0; i < digits.length; i += 4) {
    chunks.push(digits.slice(i, i + 4));
  }

  return chunks.join(' ');
};

export function PaymentForm({ plan, onSuccess, onCancel }: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cardCode: '',
  });

  // Track which fields have been touched
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    cardNumber: false,
    expirationMonth: false,
    expirationYear: false,
    cardCode: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isYearly = plan.name.includes('Yearly');
  const billingText = isYearly ? 'year' : 'month';
  const billingCycle = isYearly ? 'yearly' : 'monthly';
  const billingAmount = `$${Number(plan.price).toFixed(2)}/${billingText}`;

  console.log('Billing Info - Payment Form', {isYearly,billingText,billingCycle,billingAmount})

  // Validate form whenever data changes
  useEffect(() => {
    // For card number validation, we need to remove spaces first
    const validationData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
    };

    const result = paymentSchema.safeParse(validationData);

    if (result.success) {
      setIsFormValid(true);
      setErrors({});
    } else {
      setIsFormValid(false);
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path) {
          formattedErrors[error.path[0]] = error.message;
        }
      });
      setErrors(formattedErrors);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove existing spaces to get raw input
    const rawValue = input.replace(/\s/g, '');

    // Only proceed if input is all digits or empty
    if (/^\d*$/.test(rawValue)) {
      // Format and update state
      const formattedValue = formatCreditCardNumber(rawValue);
      setFormData((prev) => ({ ...prev, cardNumber: formattedValue }));

      // Mark field as touched
      if (!touchedFields.cardNumber) {
        setTouchedFields((prev) => ({ ...prev, cardNumber: true }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Mark all fields as touched
    setTouchedFields({
      firstName: true,
      lastName: true,
      cardNumber: true,
      expirationMonth: true,
      expirationYear: true,
      cardCode: true,
    });

    // Final validation check before submission
    const validationData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
    };

    const result = paymentSchema.safeParse(validationData);

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
          paymentInfo: validationData,
          billingCycle, // Pass the billing cycle parameter
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

  // Helper to determine if we should show an error for a field
  const shouldShowError = (fieldName: string) => {
    return (touchedFields[fieldName] || formSubmitted) && errors[fieldName];
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
              onBlur={handleBlur}
              placeholder="John"
              disabled={isSubmitting}
              className={shouldShowError('firstName') ? 'border-red-500' : ''}
            />
            {shouldShowError('firstName') && (
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
              onBlur={handleBlur}
              placeholder="Doe"
              disabled={isSubmitting}
              className={shouldShowError('lastName') ? 'border-red-500' : ''}
            />
            {shouldShowError('lastName') && (
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
            onChange={handleCardNumberChange}
            onBlur={handleBlur}
            placeholder="4111 1111 1111 1111"
            maxLength={19} // 16 digits + 3 spaces
            disabled={isSubmitting}
            className={shouldShowError('cardNumber') ? 'border-red-500' : ''}
          />
          {shouldShowError('cardNumber') && (
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
              onBlur={handleBlur}
              placeholder="01"
              maxLength={2}
              disabled={isSubmitting}
              className={
                shouldShowError('expirationMonth') ? 'border-red-500' : ''
              }
            />
            {shouldShowError('expirationMonth') && (
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
              onBlur={handleBlur}
              placeholder="2025"
              maxLength={4}
              disabled={isSubmitting}
              className={
                shouldShowError('expirationYear') ? 'border-red-500' : ''
              }
            />
            {shouldShowError('expirationYear') && (
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
              onBlur={handleBlur}
              placeholder="123"
              maxLength={4}
              disabled={isSubmitting}
              className={shouldShowError('cardCode') ? 'border-red-500' : ''}
            />
            {shouldShowError('cardCode') && (
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
        <Button
          type="submit"
          disabled={isSubmitting || (formSubmitted && !isFormValid)}
          className={
            formSubmitted && !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe for ${billingAmount}`
          )}
        </Button>
      </div>
    </form>
  );
}
