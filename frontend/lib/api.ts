/**
 * Klasso API client — talks to backend Express server.
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:3001)
 */

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    : "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("klasso_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("klasso_token", token);
  else localStorage.removeItem("klasso_token");
}

type Envelope<T> = { success: boolean; data: T; message?: string };
type Paginated<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function rawFetch(
  path: string,
  init: RequestInit = {},
  requireAuth = true
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (requireAuth) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  return fetch(url, { ...init, headers });
}

export async function apiData<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await rawFetch(path, init, true);
  const json = (await res.json().catch(() => ({}))) as Envelope<T> & { message?: string };
  if (!res.ok) {
    throw new ApiError(json.message || res.statusText || "Request failed", res.status);
  }
  if (json.success === false) {
    throw new ApiError(json.message || "Request failed", res.status);
  }
  return json.data as T;
}

export async function apiPaginated<T>(path: string): Promise<Paginated<T>> {
  const res = await rawFetch(path, {}, true);
  const json = (await res.json().catch(() => ({}))) as Paginated<T> & { message?: string };
  if (!res.ok) {
    throw new ApiError(json.message || res.statusText || "Request failed", res.status);
  }
  if (json.success === false) {
    throw new ApiError(json.message || "Request failed", res.status);
  }
  return json as Paginated<T>;
}

export async function loginRequest(email: string, password: string) {
  const res = await rawFetch(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
  const json = (await res.json().catch(() => ({}))) as Envelope<{ token: string; user: Record<string, unknown> }>;
  if (!res.ok || !json.success || !json.data?.token) {
    throw new ApiError(json.message || "Login failed", res.status);
  }
  return json.data;
}

export async function postAiChat(messages: { role: string; content: string }[]) {
  return apiData<{ reply: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}
