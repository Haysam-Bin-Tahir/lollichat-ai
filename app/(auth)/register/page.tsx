'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { toast } from '@/components/toast';
import { register, type RegisterActionState } from '../actions';

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, setState] = useState<RegisterActionState>({ status: 'idle' });

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (state.status === 'failed') {
      toast({ type: 'error', description: 'Failed to create account!' });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });
      setIsSuccessful(true);
      router.refresh();
      router.push('/topics');
    }
  }, [state, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setEmail(formData.get('email') as string);

    try {
      const response = await register(state, formData);
      setState(response);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        type: 'error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm action={handleSubmit} defaultEmail={email}>
      <SubmitButton isSuccessful={isSuccessful} disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </SubmitButton>
      <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
        {'Already have an account? '}
        <Link
          href="/login"
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
        >
          Sign in
        </Link>
        {' instead.'}
      </p>
    </AuthForm>
  );
}

// Loading fallback component
function RegisterFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded dark:bg-zinc-700 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-zinc-700 w-3/4 mx-auto"></div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
