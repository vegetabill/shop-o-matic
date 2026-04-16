import apiClient from './client';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export async function fetchCategories(householdId: string): Promise<Category[]> {
  return apiClient.get<Category[]>(`/households/${householdId}/categories`);
}

export async function createCategory(
  householdId: string,
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiClient.post<Category>(`/households/${householdId}/categories`, payload);
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return apiClient.put<Category>(
    `/households/${householdId}/categories/${categoryId}`,
    payload,
  );
}

export async function deleteCategory(
  householdId: string,
  categoryId: string,
): Promise<void> {
  return apiClient.delete<void>(`/households/${householdId}/categories/${categoryId}`);
}
