'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getMeApi } from '@/lib/api/auth';

/** Silently syncs Supabase session → authStore without any redirect or UI. */
export function BrowseAuthSync() {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try { setUser(await getMeApi()); } catch { logout(); }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try { setUser(await getMeApi()); } catch { logout(); }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
