import { apiFetch, ApiError, getApiBaseUrl, getToken, type ApiUser } from "@/lib/api";
import type { SiteSettings } from "@/lib/siteSettings";

export type AdminStats = {
  users: { total: number; active: number };
  menus: { total: number; published: number };
  subscriptions: { total: number; active: number };
  templates: { total: number; active: number };
  usersByPlan: Array<{ plan: ApiUser["plan"]; count: number }>;
};

export type AdminUserRow = ApiUser & {
  menuCount: number;
  subscriptionCount: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PlanConfig = {
  id: string;
  key: ApiUser["plan"];
  nameEn: string;
  nameAr: string;
  priceMonthly: number;
  maxMenus: number | null;
  featuresEn: string[];
  featuresAr: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionRow = {
  id: string;
  userId: string;
  plan: ApiUser["plan"];
  status: "active" | "trial" | "past_due" | "canceled" | "expired";
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; name: string | null };
};

export type TemplateRow = {
  id: string;
  category: string;
  localId: number;
  name: string;
  nameAr: string | null;
  style: string;
  styleAr: string | null;
  layoutKey: string;
  gradient: string;
  accentColor: string;
  iconKey: string;
  pattern: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMenuRow = {
  id: string;
  slug: string | null;
  name: string;
  nameAr: string | null;
  currency: string;
  pages: number;
  isPublished: boolean;
  templateCategory: string | null;
  templateId: number | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; email: string; name: string | null };
};

export async function adminStatsRequest() {
  return apiFetch<AdminStats>("/admin/stats", { auth: true });
}

export async function adminListUsersRequest(params: { q?: string; page?: number; pageSize?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<Paginated<AdminUserRow>>(`/admin/users${suffix}`, { auth: true });
}

export async function adminUpdateUserRequest(
  id: string,
  body: Partial<Pick<ApiUser, "name" | "plan" | "role" | "isActive">>
) {
  return apiFetch<{ user: ApiUser }>(`/admin/users/${id}`, {
    method: "PATCH",
    body,
    auth: true,
  });
}

export async function adminDeleteUserRequest(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/users/${id}`, { method: "DELETE", auth: true });
}

export async function adminListPlansRequest() {
  return apiFetch<PlanConfig[]>("/admin/plans", { auth: true });
}

export async function adminUpdatePlanRequest(
  key: ApiUser["plan"],
  body: Partial<Omit<PlanConfig, "id" | "key" | "createdAt" | "updatedAt">>
) {
  return apiFetch<PlanConfig>(`/admin/plans/${key}`, { method: "PATCH", body, auth: true });
}

export async function adminListSubscriptionsRequest(
  params: {
    q?: string;
    page?: number;
    pageSize?: number;
    status?: SubscriptionRow["status"];
    plan?: ApiUser["plan"];
  } = {}
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.status) qs.set("status", params.status);
  if (params.plan) qs.set("plan", params.plan);
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<Paginated<SubscriptionRow>>(`/admin/subscriptions${suffix}`, { auth: true });
}

export async function adminCreateSubscriptionRequest(body: {
  userId: string;
  plan: ApiUser["plan"];
  status?: SubscriptionRow["status"];
  notes?: string | null;
  syncUserPlan?: boolean;
}) {
  return apiFetch<SubscriptionRow>("/admin/subscriptions", { method: "POST", body, auth: true });
}

export async function adminUpdateSubscriptionRequest(
  id: string,
  body: Partial<{
    plan: ApiUser["plan"];
    status: SubscriptionRow["status"];
    notes: string | null;
    endsAt: string | null;
    syncUserPlan: boolean;
  }>
) {
  return apiFetch<SubscriptionRow>(`/admin/subscriptions/${id}`, {
    method: "PATCH",
    body,
    auth: true,
  });
}

export async function adminDeleteSubscriptionRequest(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/subscriptions/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function adminListTemplatesRequest() {
  return apiFetch<TemplateRow[]>("/admin/templates", { auth: true });
}

export async function adminUpdateTemplateRequest(
  id: string,
  body: Partial<Omit<TemplateRow, "id" | "createdAt" | "updatedAt">>
) {
  return apiFetch<TemplateRow>(`/admin/templates/${id}`, { method: "PATCH", body, auth: true });
}

export async function adminDeleteTemplateRequest(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/templates/${id}`, { method: "DELETE", auth: true });
}

export async function adminListMenusRequest(
  params: { q?: string; page?: number; pageSize?: number; published?: boolean } = {}
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.published !== undefined) qs.set("published", String(params.published));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<Paginated<AdminMenuRow>>(`/admin/menus${suffix}`, { auth: true });
}

export async function adminUpdateMenuRequest(
  id: string,
  body: Partial<{ isPublished: boolean; slug: string | null; name: string }>
) {
  return apiFetch<AdminMenuRow>(`/admin/menus/${id}`, { method: "PATCH", body, auth: true });
}

export async function adminDeleteMenuRequest(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/menus/${id}`, { method: "DELETE", auth: true });
}

export async function publicListTemplatesRequest() {
  return apiFetch<TemplateRow[]>("/public/templates");
}

export async function publicListPlansRequest() {
  return apiFetch<PlanConfig[]>("/public/plans");
}

export async function adminGetSiteSettingsRequest() {
  return apiFetch<SiteSettings>("/admin/site-settings", { auth: true });
}

export async function adminUpdateSiteSettingsRequest(body: SiteSettings) {
  const { updatedAt: _u, ...payload } = body;
  return apiFetch<SiteSettings>("/admin/site-settings", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export async function uploadImageRequest(file: File) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const url = `${getApiBaseUrl()}/uploads`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch {
    throw new ApiError("Could not reach the API", "NETWORK_ERROR", 0);
  }
  const json = await res.json();
  if (!json?.success) {
    throw new ApiError(json?.error?.message || "Upload failed", json?.error?.code || "UPLOAD_FAILED", res.status);
  }
  return json.data as { id: string; url: string; mimeType: string; sizeBytes: number };
}
