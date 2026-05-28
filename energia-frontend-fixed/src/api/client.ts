import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Inject JWT on every request
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // corrupted storage
    }
  }
  return config;
});

// Handle 401 → logout
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/api/Auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.mensaje ?? data?.message ?? error.message ?? 'Error desconocido';
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}
