'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/lib/utils/validators';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

export default function RegisterPage() {
  const { register: registerUser, registerPending } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'renter',
    },
  });

  const role = watch('role');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create an account
        </h1>
        <p className="text-sm text-gray-500">
          Join Rentas to find or list your next place.
        </p>
      </div>

      {/* Form */}
      <form
        className="space-y-5"
        onSubmit={handleSubmit((data) =>
          registerUser({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role ?? 'renter',
          }),
        )}
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="Jane"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="Smith"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {/* Role selector */}
        <div className="space-y-3">
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            {(['renter', 'landlord'] as const).map((r) => (
              <label
                key={r}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition',
                  role === r
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900',
                )}
              >
                <input
                  type="radio"
                  value={r}
                  className="sr-only"
                  {...register('role')}
                />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={registerPending}
        >
          {registerPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">Already have an account?</span>
        </div>
      </div>

      <Link
        href="/login"
        className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Sign in
      </Link>
    </div>
  );
}
