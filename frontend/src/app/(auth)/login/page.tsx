'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
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
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Sign in
        </h1>
        <p className="text-sm text-gray-600">
          Enter your email and password to access your account.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((data) => login(data))}
        noValidate
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex flex-col gap-3 pt-1">
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={loginPending}
          >
            {loginPending ? 'Signing in…' : 'Sign in'}
          </Button>
          <Link
            href="/forgot-password"
            className="text-center text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      <p className="border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-gray-900 underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
