import { api, Page } from "@/lib/apiClient";
import {
  AdminOverview,
  Agency,
  AuditEvent,
  AuditKind,
  ChecklistItem,
  DuplicatePair,
  DuplicateStatus,
  OversightRequest,
  Priority,
  VerificationStatus,
} from "@/types/admin";
import { User, UserRole, UserStatus } from "@/types/user";

// ---- Agency verification (admin only) ------------------------------------
export function listAgencies(params: { q?: string; status?: VerificationStatus; page?: number; perPage?: number } = {}) {
  return api<Page<Agency>>("/admin/agencies", { params });
}

export function updateAgency(id: number | string, body: { checklist?: ChecklistItem[]; adminNotes?: string }) {
  return api<{ agency: Agency }>(`/admin/agencies/${id}`, { method: "PATCH", body });
}

export function decideAgency(id: number | string, decision: "approve" | "request-info", adminNotes?: string) {
  return api<{ agency: Agency }>(`/admin/agencies/${id}/decision`, {
    method: "POST",
    body: { decision, adminNotes },
  });
}

// ---- Audit log and dashboard (admin only) --------------------------------
export function listAudit(params: { q?: string; kind?: AuditKind; page?: number; perPage?: number } = {}) {
  return api<Page<AuditEvent>>("/admin/audit", { params });
}

export function getOverview() {
  return api<AdminOverview>("/admin/overview");
}

// ---- Request oversight and duplicate review (admin only) -----------------
export function listOversightRequests(
  params: { q?: string; stage?: string; priority?: Priority; page?: number; perPage?: number } = {},
) {
  return api<Page<OversightRequest>>("/admin/requests", { params });
}

export function listDuplicates(params: { status?: DuplicateStatus; page?: number; perPage?: number } = {}) {
  return api<Page<DuplicatePair>>("/admin/duplicates", { params });
}

export function scanDuplicates() {
  return api<{ created: number }>("/admin/duplicates/scan", { method: "POST" });
}

export function decideDuplicate(id: number | string, status: "separate" | "escalated") {
  return api<{ duplicate: DuplicatePair }>(`/admin/duplicates/${id}`, { method: "PATCH", body: { status } });
}

// ---- Users (admin only) --------------------------------------------------
export function listUsers(
  params: { q?: string; role?: UserRole; status?: UserStatus; page?: number; perPage?: number } = {},
) {
  return api<Page<User>>("/users", { params });
}

export function setUserStatus(id: number | string, status: "active" | "suspended") {
  return api<{ user: User }>(`/users/${id}/status`, { method: "PATCH", body: { status } });
}
