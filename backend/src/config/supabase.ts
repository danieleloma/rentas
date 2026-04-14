import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  if (!adminClient) {
    adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    config.supabase.url && config.supabase.serviceRoleKey && config.supabase.storageBucket,
  );
}
