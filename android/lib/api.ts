import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'klasso_token';

/** Android emulator: http://10.0.2.2:3001 · iOS simulator: http://localhost:3001 · device: your LAN IP */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://10.0.2.2:3001';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null) {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

type Envelope<T> = { success: boolean; data: T; message?: string };

export async function apiData<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok || json.success === false) {
    throw new Error(json.message || res.statusText || 'Request failed');
  }
  return json.data as T;
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json().catch(() => ({}))) as Envelope<{ token: string; user: Record<string, unknown> }>;
  if (!res.ok || !json.success || !json.data?.token) {
    throw new Error(json.message || 'Login failed');
  }
  return json.data;
}
