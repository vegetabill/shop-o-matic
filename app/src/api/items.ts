import apiClient from './client';
import { Item, CreateItemPayload, UpdateItemPayload, EndShoppingPayload } from '../types';

export async function fetchItems(householdId: string): Promise<Item[]> {
  return apiClient.get<Item[]>(`/households/${householdId}/items`);
}

export async function createItem(
  householdId: string,
  payload: CreateItemPayload,
): Promise<Item> {
  return apiClient.post<Item>(`/households/${householdId}/items`, payload);
}

export async function updateItem(
  householdId: string,
  itemId: string,
  payload: UpdateItemPayload,
): Promise<Item> {
  return apiClient.put<Item>(`/households/${householdId}/items/${itemId}`, payload);
}

export async function deleteItem(householdId: string, itemId: string): Promise<void> {
  return apiClient.delete<void>(`/households/${householdId}/items/${itemId}`);
}

export async function endShopping(
  householdId: string,
  payload: EndShoppingPayload,
): Promise<void> {
  return apiClient.post<void>(`/households/${householdId}/shopping/end`, payload);
}

export async function searchItems(householdId: string, query: string): Promise<Item[]> {
  return apiClient.get<Item[]>(`/households/${householdId}/items`, {
    params: { q: query },
  });
}
