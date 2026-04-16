import apiClient from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function exchangeGoogleToken(token: string, isIdToken: boolean = true): Promise<AuthResponse> {
  const body = isIdToken
    ? { id_token: token }
    : { access_token: token };
  return apiClient.post<AuthResponse>('/auth/google', body);
}

export async function mockSignIn(): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/mock', {});
}
