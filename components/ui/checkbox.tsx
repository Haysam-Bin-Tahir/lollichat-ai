'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            'h-4 w-4 rounded border-primary text-primary focus:ring-primary focus:ring-offset-0',
            className,
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
