import apiClient from './client';
import { Store, CreateStorePayload, UpdateStorePayload } from '../types';

export async function fetchStores(householdId: number): Promise<Store[]> {
  return apiClient.get<Store[]>(`/households/${householdId}/stores`);
}

export async function createStore(
  householdId: number,
  payload: CreateStorePayload,
): Promise<Store> {
  return apiClient.post<Store>(`/households/${householdId}/stores`, payload);
}

export async function updateStore(
  householdId: number,
  storeId: number,
  payload: UpdateStorePayload,
): Promise<Store> {
  return apiClient.put<Store>(`/households/${householdId}/stores/${storeId}`, payload);
}

export async function deleteStore(householdId: number, storeId: number): Promise<void> {
  return apiClient.delete<void>(`/households/${householdId}/stores/${storeId}`);
}
