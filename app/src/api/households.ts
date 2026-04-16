import apiClient from './client';
import { Household } from '../types';

export async function fetchHouseholds(): Promise<Household[]> {
  return apiClient.get<Household[]>('/households');
}

export async function createHousehold(name: string): Promise<Household> {
  return apiClient.post<Household>('/households', { name });
}

export async function joinHousehold(shareToken: string): Promise<Household> {
  return apiClient.post<Household>('/households/join', { share_token: shareToken });
}

export async function fetchHousehold(id: string): Promise<Household> {
  return apiClient.get<Household>(`/households/${id}`);
}
