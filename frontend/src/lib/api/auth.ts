import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

async function fetchProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, avatar_url, role, email_verified, created_at')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role,
    emailVerified: data.email_verified,
    createdAt: data.created_at,
  };
}

export async function loginApi(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = await fetchProfile(data.user.id);
  return { user };
}

export async function registerApi(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        role: payload.role || 'renter',
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Registration failed');

  // Give the DB trigger ~500 ms to create the public.users row
  await new Promise((r) => setTimeout(r, 500));

  const user = await fetchProfile(data.user.id);
  return { user };
}

export async function getMeApi(): Promise<User> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');
  return fetchProfile(authUser.id);
}

export async function logoutApi() {
  await supabase.auth.signOut();
}
