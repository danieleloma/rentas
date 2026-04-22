'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getMeApi } from '@/lib/api/auth';

interface DashboardAuthGateProps {
  children: React.ReactNode;
  /** When true, unauthenticated visitors are allowed (no redirect to /login) */
  allowGuests?: boolean;
}

export function DashboardAuthGate({ children, allowGuests = false }: DashboardAuthGateProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { setUser, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          const user = await getMeApi();
          setUser(user);
        } catch {
          logout();
        }
      } else {
        logout();
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const user = await getMeApi();
          setUser(user);
        } catch {
          logout();
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated && !allowGuests) router.replace('/login');
  }, [ready, isAuthenticated, allowGuests, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-gray-900 border-t-transparent dark:border-gray-100"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated && !allowGuests) return null;

  return <>{children}</>;
}
