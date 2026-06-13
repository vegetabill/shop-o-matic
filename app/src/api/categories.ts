import apiClient from './client';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export async function fetchCategories(householdId: number): Promise<Category[]> {
  return apiClient.get<Category[]>(`/households/${householdId}/categories`);
}

export async function createCategory(
  householdId: number,
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiClient.post<Category>(`/households/${householdId}/categories`, payload);
}

export async function updateCategory(
  householdId: number,
  categoryId: number,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return apiClient.put<Category>(
    `/households/${householdId}/categories/${categoryId}`,
    payload,
  );
}

export async function deleteCategory(
  householdId: number,
  categoryId: number,
): Promise<void> {
  return apiClient.delete<void>(`/households/${householdId}/categories/${categoryId}`);
}
