import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SECURE_STORE_JWT_KEY } from '../constants/config';

type OnUnauthorizedCallback = () => void;
type OnApiErrorCallback = (method: string, url: string, status: number | null, body: unknown) => void;

let onUnauthorizedCallback: OnUnauthorizedCallback | null = null;
let onApiErrorCallback: OnApiErrorCallback | null = null;

export function setOnUnauthorizedCallback(cb: OnUnauthorizedCallback): void {
  onUnauthorizedCallback = cb;
}

export function setOnApiErrorCallback(cb: OnApiErrorCallback): void {
  onApiErrorCallback = cb;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await SecureStore.getItemAsync(SECURE_STORE_JWT_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status ?? null;
    const method = config?.method?.toUpperCase() ?? 'UNKNOWN';
    const url = config ? `${config.baseURL ?? ''}${config.url ?? ''}` : 'unknown URL';
    const body = error.response?.data ?? error.message;
    console.error(`[API] ${method} ${url} → ${status ?? 'no response'}`, body);
    onApiErrorCallback?.(method, url, status, body);

    if (status === 401) {
      await SecureStore.deleteItemAsync(SECURE_STORE_JWT_KEY);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.get<T>(url, config);
  return response.data;
}

async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
}

async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.put<T>(url, data, config);
  return response.data;
}

async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.delete<T>(url, config);
  return response.data;
}

const apiClient = { get, post, put, delete: del };
export default apiClient;
