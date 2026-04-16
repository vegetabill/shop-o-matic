import apiClient from './client';
import { Store, CreateStorePayload, UpdateStorePayload } from '../types';

export async function fetchStores(householdId: string): Promise<Store[]> {
  return apiClient.get<Store[]>(`/households/${householdId}/stores`);
}

export async function createStore(
  householdId: string,
  payload: CreateStorePayload,
): Promise<Store> {
  return apiClient.post<Store>(`/households/${householdId}/stores`, payload);
}

export async function updateStore(
  householdId: string,
  storeId: string,
  payload: UpdateStorePayload,
): Promise<Store> {
  return apiClient.put<Store>(`/households/${householdId}/stores/${storeId}`, payload);
}

export async function deleteStore(householdId: string, storeId: string): Promise<void> {
  return apiClient.delete<void>(`/households/${householdId}/stores/${storeId}`);
}
