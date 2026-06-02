import Constants from 'expo-constants';
import axios from 'axios';

const PROD_URL = 'https://orbitx-api-ve63.onrender.com';

function resolveApiBase(): string {
  const localUrl = process.env.EXPO_PUBLIC_API_URL;
  if (localUrl) return localUrl;
  return PROD_URL;
}

export const API_BASE = resolveApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message: string =
      err.response?.data?.message ?? err.message ?? 'Erro inesperado';
    return Promise.reject(new Error(message));
  },
);
