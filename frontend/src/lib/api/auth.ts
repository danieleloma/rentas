import { apiClient } from './client';
import type { User, AuthTokens, ApiResponse } from '@/types';

export async function loginApi(email: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<{ user: User } & AuthTokens>>(
    '/auth/login',
    { email, password },
  );
  return data.data;
}

export async function registerApi(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}) {
  const { data } = await apiClient.post<ApiResponse<{ user: User } & AuthTokens>>(
    '/auth/register',
    payload,
  );
  return data.data;
}

export async function getMeApi() {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function logoutApi() {
  await apiClient.post('/auth/logout');
}
