'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { loginApi, registerApi, logoutApi } from '@/lib/api/auth';
import { useUIStore } from '@/store/uiStore';

function toastMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function useAuth() {
  const router = useRouter();
  const { setUser, logout: clearAuth, isAuthenticated, user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      addToast('Logged in successfully', 'success');
      router.push('/dashboard');
    },
    onError: (err) => {
      addToast(toastMessage(err, 'Invalid email or password'), 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setUser(data.user);
      addToast('Account created successfully', 'success');
      router.push('/dashboard');
    },
    onError: (err) => {
      addToast(toastMessage(err, 'Registration failed. Please try again.'), 'error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
