'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/lib/utils/validators';
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
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Create account
        </h1>
        <p className="text-sm text-gray-600">
          Join Rentas to find or list your next place.
        </p>
      </div>

      <form
        className="space-y-4"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            required
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            required
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
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
          autoComplete="new-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium text-gray-700">
            I am a
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                role === 'renter'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
              )}
            >
              <input
                type="radio"
                value="renter"
                className="size-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                {...register('role')}
              />
              Renter
            </label>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                role === 'landlord'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
              )}
            >
              <input
                type="radio"
                value="landlord"
                className="size-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                {...register('role')}
              />
              Landlord
            </label>
          </div>
          {errors.role ? (
            <p className="text-sm text-red-600" role="alert">
              {errors.role.message}
            </p>
          ) : null}
        </fieldset>

        <Button
          type="submit"
          className="mt-2 h-10 w-full"
          disabled={registerPending}
        >
          {registerPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-gray-900 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
