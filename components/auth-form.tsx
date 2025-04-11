// components/auth-form.tsx
import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { GoogleButton } from './ui/google-button';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Google auth option */}
      <div className="flex flex-col gap-2 px-4 sm:px-16">
        <GoogleButton />
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-300 dark:border-zinc-700 absolute w-full" />
          <div className="bg-background text-xs text-gray-500 dark:text-zinc-400 relative px-2">
            OR
          </div>
        </div>
      </div>

      {/* Email/password auth option */}
      <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Email Address
          </Label>

          <Input
            id="email"
            name="email"
            className="bg-muted text-md md:text-sm"
            type="email"
            placeholder="user@acme.com"
            autoComplete="email"
            required
            autoFocus
            defaultValue={defaultEmail}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Password
          </Label>

          <Input
            id="password"
            name="password"
            className="bg-muted text-md md:text-sm"
            type="password"
            required
          />
        </div>

        {children}
      </Form>
    </div>
  );
}
