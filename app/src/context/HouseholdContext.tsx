import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  useState,
} from 'react';
import {
  Household,
  HouseholdState,
  HouseholdAction,
  Item,
  Store,
  Category,
  CreateItemPayload,
  UpdateItemPayload,
  CreateStorePayload,
  UpdateStorePayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types';
import * as householdsApi from '../api/households';
import * as itemsApi from '../api/items';
import * as storesApi from '../api/stores';
import * as categoriesApi from '../api/categories';
import { useAuth } from './AuthContext';

interface HouseholdContextValue extends HouseholdState {
  loadError: string | null;

  // household ops
  loadHouseholds: () => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (token: string) => Promise<void>;
  setActiveHousehold: (household: Household) => void;

  // items
  items: Item[];
  isLoadingItems: boolean;
  loadItems: () => Promise<void>;
  addItem: (payload: CreateItemPayload) => Promise<Item>;
  updateItem: (itemId: string, payload: UpdateItemPayload) => Promise<Item>;
  removeItem: (itemId: string) => Promise<void>;
  endShopping: (purchasedItemIds: string[], skippedItemIds?: string[], storeId?: string) => Promise<void>;
  searchItems: (query: string) => Promise<Item[]>;

  // stores
  stores: Store[];
  isLoadingStores: boolean;
  loadStores: () => Promise<void>;
  addStore: (payload: CreateStorePayload) => Promise<Store>;
  updateStore: (storeId: string, payload: UpdateStorePayload) => Promise<Store>;
  removeStore: (storeId: string) => Promise<void>;

  // categories
  categories: Category[];
  isLoadingCategories: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (categoryId: string, payload: UpdateCategoryPayload) => Promise<Category>;
  removeCategory: (categoryId: string) => Promise<void>;
}

const initialHouseholdState: HouseholdState = {
  households: [],
  activeHousehold: null,
  isLoading: false,
};

function householdReducer(state: HouseholdState, action: HouseholdAction): HouseholdState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_HOUSEHOLDS':
      return { ...state, households: action.payload, isLoading: false };
    case 'ADD_HOUSEHOLD':
      return {
        ...state,
        households: [...state.households, action.payload],
        isLoading: false,
      };
    case 'SET_ACTIVE_HOUSEHOLD':
      return { ...state, activeHousehold: action.payload };
    default:
      return state;
  }
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(householdReducer, initialHouseholdState);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const householdId = state.activeHousehold?.id;

  const loadHouseholds = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setLoadError(null);
    try {
      const data = await householdsApi.fetchHouseholds();
      dispatch({ type: 'SET_HOUSEHOLDS', payload: data });
      if (data.length === 1 && !state.activeHousehold) {
        dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: data[0] });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
      setLoadError('Could not connect to the server. Check your connection and try again.');
    }
  }, [state.activeHousehold]);

  const createHousehold = useCallback(async (name: string) => {
    const household = await householdsApi.createHousehold(name);
    dispatch({ type: 'ADD_HOUSEHOLD', payload: household });
    dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: household });
  }, []);

  const joinHousehold = useCallback(async (token: string) => {
    const household = await householdsApi.joinHousehold(token);
    dispatch({ type: 'ADD_HOUSEHOLD', payload: household });
    dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: household });
  }, []);

  const setActiveHousehold = useCallback((household: Household) => {
    dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: household });
  }, []);

  // Items
  const loadItems = useCallback(async () => {
    if (!householdId) return;
    setIsLoadingItems(true);
    try {
      const data = await itemsApi.fetchItems(householdId);
      setItems(data);
    } finally {
      setIsLoadingItems(false);
    }
  }, [householdId]);

  const addItem = useCallback(
    async (payload: CreateItemPayload): Promise<Item> => {
      if (!householdId) throw new Error('No active household');
      const item = await itemsApi.createItem(householdId, payload);
      setItems((prev) => [...prev, item]);
      return item;
    },
    [householdId],
  );

  const updateItem = useCallback(
    async (itemId: string, payload: UpdateItemPayload): Promise<Item> => {
      if (!householdId) throw new Error('No active household');
      const updated = await itemsApi.updateItem(householdId, itemId, payload);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      return updated;
    },
    [householdId],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!householdId) throw new Error('No active household');
      const updated = await itemsApi.markItemUnavailable(householdId, itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    },
    [householdId],
  );

  const endShopping = useCallback(
    async (purchasedItemIds: string[], skippedItemIds?: string[], storeId?: string) => {
      if (!householdId) throw new Error('No active household');
      await itemsApi.endShopping(householdId, {
        purchased_item_ids: purchasedItemIds,
        skipped_item_ids: skippedItemIds,
        store_id: storeId,
      });
      await loadItems();
    },
    [householdId, loadItems],
  );

  const searchItems = useCallback(
    async (query: string): Promise<Item[]> => {
      if (!householdId) return [];
      return itemsApi.searchItems(householdId, query);
    },
    [householdId],
  );

  // Stores
  const loadStores = useCallback(async () => {
    if (!householdId) return;
    setIsLoadingStores(true);
    try {
      const data = await storesApi.fetchStores(householdId);
      setStores(data);
    } finally {
      setIsLoadingStores(false);
    }
  }, [householdId]);

  const addStore = useCallback(
    async (payload: CreateStorePayload): Promise<Store> => {
      if (!householdId) throw new Error('No active household');
      const store = await storesApi.createStore(householdId, payload);
      setStores((prev) => [...prev, store]);
      return store;
    },
    [householdId],
  );

  const updateStore = useCallback(
    async (storeId: string, payload: UpdateStorePayload): Promise<Store> => {
      if (!householdId) throw new Error('No active household');
      const updated = await storesApi.updateStore(householdId, storeId, payload);
      setStores((prev) => prev.map((s) => (s.id === storeId ? updated : s)));
      return updated;
    },
    [householdId],
  );

  const removeStore = useCallback(
    async (storeId: string) => {
      if (!householdId) throw new Error('No active household');
      await storesApi.deleteStore(householdId, storeId);
      setStores((prev) => prev.filter((s) => s.id !== storeId));
    },
    [householdId],
  );

  // Categories
  const loadCategories = useCallback(async () => {
    if (!householdId) return;
    setIsLoadingCategories(true);
    try {
      const data = await categoriesApi.fetchCategories(householdId);
      setCategories(data);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [householdId]);

  const addCategory = useCallback(
    async (payload: CreateCategoryPayload): Promise<Category> => {
      if (!householdId) throw new Error('No active household');
      const category = await categoriesApi.createCategory(householdId, payload);
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [householdId],
  );

  const updateCategory = useCallback(
    async (categoryId: string, payload: UpdateCategoryPayload): Promise<Category> => {
      if (!householdId) throw new Error('No active household');
      const updated = await categoriesApi.updateCategory(householdId, categoryId, payload);
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)));
      return updated;
    },
    [householdId],
  );

  const removeCategory = useCallback(
    async (categoryId: string) => {
      if (!householdId) throw new Error('No active household');
      await categoriesApi.deleteCategory(householdId, categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    },
    [householdId],
  );

  // Load data when household changes
  useEffect(() => {
    if (householdId) {
      loadItems();
      loadStores();
      loadCategories();
    } else {
      setItems([]);
      setStores([]);
      setCategories([]);
    }
  }, [householdId]);

  // Load households when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadHouseholds();
    } else {
      dispatch({ type: 'SET_HOUSEHOLDS', payload: [] });
      dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: null });
    }
  }, [isAuthenticated]);

  return (
    <HouseholdContext.Provider
      value={{
        ...state,
        loadError,
        loadHouseholds,
        createHousehold,
        joinHousehold,
        setActiveHousehold,
        items,
        isLoadingItems,
        loadItems,
        addItem,
        updateItem,
        removeItem,
        endShopping,
        searchItems,
        stores,
        isLoadingStores,
        loadStores,
        addStore,
        updateStore,
        removeStore,
        categories,
        isLoadingCategories,
        loadCategories,
        addCategory,
        updateCategory,
        removeCategory,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}
