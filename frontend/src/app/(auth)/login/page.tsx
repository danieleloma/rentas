'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loginPending } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">
          Sign in to your Rentas account.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit((data) => login(data))} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={loginPending}
        >
          {loginPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">Don&apos;t have an account?</span>
        </div>
      </div>

      <Link
        href="/register"
        className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Create account
      </Link>
    </div>
  );
}
