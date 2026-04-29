import apiClient from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function exchangeAuth0Token(idToken: string): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/auth0', { id_token: idToken });
}

