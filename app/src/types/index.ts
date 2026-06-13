export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Household {
  id: number;
  name: string;
  share_token: string;
  created_at: string;
}

export interface Store {
  id: number;
  household_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: number;
  household_id: number;
  name: string;
  created_at: string;
}

export interface ItemStore {
  store_id: number;
  store_name: string;
  store_color: string;
}

export type ItemPriority = 'none' | 'low' | 'high';

export interface Item {
  id: number;
  household_id: number;
  name: string;
  notes?: string;
  priority: ItemPriority;
  category_id?: number;
  category_name?: string;
  on_list: boolean;
  purchased: boolean;
  stores: ItemStore[];
  last_purchased_at?: string;
  last_purchased_store_name?: string;
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
  category_id?: number;
  store_ids?: number[];
}

export interface UpdateItemPayload {
  name?: string;
  notes?: string;
  priority?: ItemPriority;
  category_id?: number | null;
  store_ids?: number[];
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
}

export interface UpdateCategoryPayload {
  name?: string;
}

export interface ActiveTrip {
  id: number;
  store_id: number | null;
  store_name: string | null;
  store_color: string | null;
  purchased_item_ids: number[];
  skipped_item_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface PauseShoppingPayload {
  store_id?: number;
  trip_id?: number;
  purchased_item_ids: number[];
  skipped_item_ids: number[];
}

export interface EndShoppingPayload {
  purchased_item_ids: number[];
  skipped_item_ids?: number[];
  store_id?: number;
  trip_id?: number;
}
