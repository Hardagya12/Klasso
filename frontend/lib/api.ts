/**
 * Klasso API client — talks to backend Express server.
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:3001) — must match the port where `npm run dev` runs in /backend.
 * Always use an absolute URL so SSR and the browser both hit Express, not Next.js (which has no /api proxy).
 */
function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3001";
}

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
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (requireAuth) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Network error";
    throw new ApiError(
      `${msg} — is the backend running at ${base}? Set NEXT_PUBLIC_API_URL if it uses another port.`,
      0
    );
  }
  return res;
}

function errorMessageFromResponse(
  res: Response,
  json: { message?: string }
): string {
  const hint =
    res.status === 404
      ? " Not found — check NEXT_PUBLIC_API_URL matches your backend port."
      : "";
  return (json.message || res.statusText || "Request failed") + hint;
}

export async function apiData<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await rawFetch(path, init, true);
  const json = (await res.json().catch(() => ({}))) as Envelope<T> & { message?: string };
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("klasso_token");
      window.location.href = "/login";
    }
    throw new ApiError(errorMessageFromResponse(res, json), res.status);
  }
  if (json.success === false) {
    throw new ApiError(json.message || "Request failed", res.status);
  }
  return json.data as T;
}

/** Fire-and-forget fetch (POST/DELETE) — throws on non-OK, returns Response. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await rawFetch(path, init, true);
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("klasso_token");
      window.location.href = "/login";
    }
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(errorMessageFromResponse(res, json), res.status);
  }
  return res;
}

export async function apiPaginated<T>(path: string): Promise<Paginated<T>> {
  const res = await rawFetch(path, {}, true);
  const json = (await res.json().catch(() => ({}))) as Paginated<T> & { message?: string };
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("klasso_token");
      window.location.href = "/login";
    }
    throw new ApiError(errorMessageFromResponse(res, json), res.status);
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
  if (!res.ok) {
    throw new ApiError(errorMessageFromResponse(res, json), res.status);
  }
  if (!json.success || !json.data?.token) {
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
