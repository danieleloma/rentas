'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Reset password
        </h1>
        <p className="text-sm text-gray-600">
          We&apos;ll email you a link to reset your password if an account
          exists.
        </p>
      </div>

      {submitted ? (
        <div
          className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900"
          role="status"
        >
          If an account exists for that email, you&apos;ll receive reset
          instructions shortly.
        </div>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => {
          setSubmitted(true);
          reset();
        })}
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="fp-email">Email</Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <Button type="submit" className="h-10 w-full">
          Send reset link
        </Button>
      </form>

      <p className="border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-medium text-gray-900 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
