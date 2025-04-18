import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  // Stripe CardElement already handles formatting
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="card-element" className="text-sm font-medium">
          Card Details
        </label>
        <CardElement
          id="card-element"
          options={cardElementOptions}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
        />
      </div>

      {/* Other payment form fields */}
    </div>
  );
}
