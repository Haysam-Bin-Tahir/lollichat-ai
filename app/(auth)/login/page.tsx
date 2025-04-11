'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

// This component will handle the search params
function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  // Get search params with a runtime check
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  console.log(searchParams.get('callbackUrl'), window.location.origin, 'urls');

  const callbackUrl =
    searchParams.get('callbackUrl') === `${window.location.origin}/`
      ? '/topics'
      : !searchParams.get('callbackUrl')
        ? '/topics'
        : searchParams.get('callbackUrl');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      toast({
        type: 'error',
        description: 'Login failed. Please check your credentials.',
      });
    }
  }, [error]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setEmail(email);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          type: 'error',
          description: 'Invalid credentials!',
        });
        setIsSubmitting(false);
      } else {
        setIsSuccessful(true);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        type: 'error',
        description: 'An error occurred during login.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm action={handleSubmit} defaultEmail={email}>
      <SubmitButton isSuccessful={isSuccessful} disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </SubmitButton>
      <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
        {"Don't have an account? "}
        <Link
          href="/register"
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
        >
          Sign up
        </Link>
        {' for free.'}
      </p>
    </AuthForm>
  );
}

// Loading fallback component
function LoginFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-zinc-700 w-3/4 mx-auto"></div>
    </div>
  );
}

// Main page component
export default function Page() {
  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
