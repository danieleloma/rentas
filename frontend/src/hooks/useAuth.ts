'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { loginApi, registerApi, getMeApi, logoutApi } from '@/lib/api/auth';
import { useUIStore } from '@/store/uiStore';

function toastFromApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    const msg = data?.error?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    if (!error.response) {
      return 'Cannot reach the API. Start the backend on the port in NEXT_PUBLIC_API_URL (often :3000) and avoid running the web app on the same port as the API.';
    }
  }
  return fallback;
}

export function useAuth() {
  const router = useRouter();
  const { setAuth, logout: clearAuth, isAuthenticated, user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
    enabled: isAuthenticated,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      addToast('Logged in successfully', 'success');
      router.push('/listings');
    },
    onError: (err) => {
      addToast(toastFromApiError(err, 'Invalid email or password'), 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      addToast('Account created successfully', 'success');
      router.push('/listings');
    },
    onError: (err) => {
      addToast(toastFromApiError(err, 'Registration failed. Please try again.'), 'error');
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
    user: meQuery.data || user,
    isAuthenticated,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
