const TOKEN_KEY = "carta_token";

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "restaurant" | "business";
  role: "user" | "super_admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000/api";
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the API. Is the backend running on port 4000?",
      "NETWORK_ERROR",
      0
    );
  }

  let json: ApiSuccess<T> | ApiFailure | null = null;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new ApiError("Could not reach the server", "NETWORK_ERROR", res.status || 0);
  }

  if (!json || !("success" in json) || !json.success) {
    const message = json && "error" in json ? json.error.message : "Request failed";
    const code = json && "error" in json ? json.error.code : "REQUEST_FAILED";
    throw new ApiError(message, code, res.status);
  }

  return json.data;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<{ user: ApiUser; token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerRequest(email: string, password: string, name?: string) {
  return apiFetch<{ user: ApiUser; token: string }>("/auth/register", {
    method: "POST",
    body: { email, password, name },
  });
}

export async function meRequest() {
  return apiFetch<{ user: ApiUser }>("/auth/me", { auth: true });
}

export async function updateProfileRequest(name: string) {
  return apiFetch<{ user: ApiUser }>("/users/me", {
    method: "PATCH",
    body: { name },
    auth: true,
  });
}

export async function updatePlanRequest(plan: ApiUser["plan"]) {
  return apiFetch<{ user: ApiUser }>("/users/me/plan", {
    method: "PATCH",
    body: { plan },
    auth: true,
  });
}

export type MenuSummary = {
  id: string;
  slug: string | null;
  name: string;
  nameAr: string | null;
  currency: string;
  pages: number;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
};

export type ApiMenu = {
  id: string;
  slug?: string | null;
  name: string;
  nameAr?: string;
  titleStyle?: unknown;
  vendorStyle?: unknown;
  categories: unknown[];
  designElements?: unknown[];
  vendorName?: string;
  vendorLogo?: string;
  theme?: unknown;
  pages?: number;
  currency?: string;
  language?: "en" | "ar";
  isPublished?: boolean;
  templateCategory?: string | null;
  templateId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MenuUpsertBody = {
  name: string;
  nameAr?: string;
  slug?: string | null;
  titleStyle?: unknown;
  vendorStyle?: unknown;
  categories: unknown[];
  designElements?: unknown[];
  vendorName?: string;
  vendorLogo?: string;
  theme?: unknown;
  pages?: number;
  currency?: string;
  language?: "en" | "ar";
  isPublished?: boolean;
  templateCategory?: string | null;
  templateId?: number | null;
};

export async function listMenusRequest() {
  return apiFetch<MenuSummary[]>("/menus", { auth: true });
}

export async function createMenuRequest(body: MenuUpsertBody) {
  return apiFetch<ApiMenu>("/menus", { method: "POST", body, auth: true });
}

export async function updateMenuRequest(id: string, body: MenuUpsertBody) {
  return apiFetch<ApiMenu>(`/menus/${id}`, { method: "PUT", body, auth: true });
}

export async function deleteMenuRequest(id: string) {
  return apiFetch<{ deleted: boolean }>(`/menus/${id}`, { method: "DELETE", auth: true });
}

export async function getPublicMenuRequest(idOrSlug: string) {
  return apiFetch<ApiMenu>(`/public/menus/${encodeURIComponent(idOrSlug)}`);
}

