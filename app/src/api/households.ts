import apiClient from './client';
import { Household } from '../types';

export async function fetchHouseholds(): Promise<Household[]> {
  return apiClient.get<Household[]>('/households');
}

export async function createHousehold(name: string): Promise<Household> {
  return apiClient.post<Household>('/households', { name });
}

export async function joinHousehold(joinCode: string): Promise<Household> {
  return apiClient.post<Household>('/households/join', { join_code: joinCode });
}

export async function fetchHousehold(id: number): Promise<Household> {
  return apiClient.get<Household>(`/households/${id}`);
}
