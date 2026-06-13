import apiClient from './client';
import { Item, CreateItemPayload, UpdateItemPayload, EndShoppingPayload, ActiveTrip, PauseShoppingPayload } from '../types';

export async function fetchItems(householdId: number): Promise<Item[]> {
  return apiClient.get<Item[]>(`/households/${householdId}/items`);
}

export async function createItem(
  householdId: number,
  payload: CreateItemPayload,
): Promise<Item> {
  return apiClient.post<Item>(`/households/${householdId}/items`, payload);
}

export async function updateItem(
  householdId: number,
  itemId: number,
  payload: UpdateItemPayload,
): Promise<Item> {
  return apiClient.put<Item>(`/households/${householdId}/items/${itemId}`, payload);
}

export async function markItemUnavailable(householdId: number, itemId: number): Promise<Item> {
  return apiClient.post<Item>(`/households/${householdId}/items/${itemId}/mark_unavailable`);
}

export async function getActiveTrips(householdId: number): Promise<ActiveTrip[]> {
  return apiClient.get<ActiveTrip[]>(`/households/${householdId}/shopping/active`);
}

export async function pauseTrip(
  householdId: number,
  payload: PauseShoppingPayload,
): Promise<ActiveTrip> {
  return apiClient.post<ActiveTrip>(`/households/${householdId}/shopping/pause`, payload);
}

export async function endShopping(
  householdId: number,
  payload: EndShoppingPayload,
): Promise<void> {
  return apiClient.post<void>(`/households/${householdId}/shopping/end`, payload);
}

export async function searchItems(householdId: number, query: string): Promise<Item[]> {
  return apiClient.get<Item[]>(`/households/${householdId}/items`, {
    params: { q: query },
  });
}
