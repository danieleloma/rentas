'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

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
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {submitted && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground" role="status">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>If an account exists for that email, you&apos;ll receive reset instructions shortly.</span>
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => { setSubmitted(true); reset(); })}
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="fp-email">Email address</Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">Remember your password?</span>
        </div>
      </div>

      <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        Back to sign in
      </Link>
    </div>
  );
}
