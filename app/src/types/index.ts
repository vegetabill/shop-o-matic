export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Household {
  id: string;
  name: string;
  share_token: string;
  created_at: string;
}

export interface Store {
  id: string;
  household_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface ItemStore {
  store_id: string;
  store_name: string;
  store_color: string;
}

export type ItemPriority = 'none' | 'low' | 'high';

export interface Item {
  id: string;
  household_id: string;
  name: string;
  notes?: string;
  priority: ItemPriority;
  category_id?: string;
  category_name?: string;
  on_list: boolean;
  purchased: boolean;
  stores: ItemStore[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface HouseholdState {
  households: Household[];
  activeHousehold: Household | null;
  isLoading: boolean;
}

export interface AppState {
  items: Item[];
  stores: Store[];
  categories: Category[];
  isLoadingItems: boolean;
  isLoadingStores: boolean;
  isLoadingCategories: boolean;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'SIGN_OUT' };

export type HouseholdAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HOUSEHOLDS'; payload: Household[] }
  | { type: 'ADD_HOUSEHOLD'; payload: Household }
  | { type: 'SET_ACTIVE_HOUSEHOLD'; payload: Household | null };

export interface CreateItemPayload {
  name: string;
  notes?: string;
  priority?: ItemPriority;
  category_id?: string;
  store_ids?: string[];
}

export interface UpdateItemPayload {
  name?: string;
  notes?: string;
  priority?: ItemPriority;
  category_id?: string | null;
  store_ids?: string[];
  on_list?: boolean;
  purchased?: boolean;
}

export interface CreateStorePayload {
  name: string;
  color: string;
}

export interface UpdateStorePayload {
  name?: string;
  color?: string;
}

export interface CreateCategoryPayload {
  name: string;
  sort_order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  sort_order?: number;
}

export interface EndShoppingPayload {
  purchased_item_ids: string[];
}
