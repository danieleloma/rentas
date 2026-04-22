import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, avatar_url, role, email_verified, created_at')
    .eq('id', userId)
    .single();

  if (error) return null;

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

/** Build a minimal User from Supabase auth metadata when the public.users row is missing. */
function userFromAuthUser(authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): User {
  const meta = authUser.user_metadata ?? {};
  const email = authUser.email ?? '';
  const localPart = email.split('@')[0] ?? 'User';
  return {
    id: authUser.id,
    email,
    firstName: meta.first_name ?? meta.firstName ?? localPart,
    lastName: meta.last_name ?? meta.lastName ?? '',
    phone: meta.phone ?? undefined,
    avatarUrl: meta.avatar_url ?? undefined,
    role: (meta.role as User['role']) ?? 'renter',
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
}

export async function loginApi(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await fetchProfile(data.user.id);
  const user = profile ?? userFromAuthUser(data.user);
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

  const profile = await fetchProfile(data.user.id);
  const user = profile ?? userFromAuthUser(data.user);
  return { user };
}

export async function getMeApi(): Promise<User> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const profile = await fetchProfile(authUser.id);
  return profile ?? userFromAuthUser(authUser);
}

export async function logoutApi() {
  await supabase.auth.signOut();
}
