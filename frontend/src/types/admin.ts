import { Category } from "@/data/constants/categories";
import { LifecycleStage } from "@/data/constants/lifecycle";

// ---- Agency verification -------------------------------------------------

export type VerificationStatus = "pending" | "re-review" | "more-info" | "verified";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Agency {
  id: string;
  name: string;
  categories: Category[];
  counties: string[];
  status: VerificationStatus;
  /** ISO date the application was submitted */
  submittedOn: string;
  /** ISO date of the last update by the agency (shown for re-review) */
  updatedOn?: string;
  /** Short note shown in the queue, e.g. "Information updated" */
  note?: string;
  checklist: ChecklistItem[];
}

// ---- Audit activity ------------------------------------------------------

export type AuditKind = "request" | "delivery" | "pledge" | "agency" | "user" | "safety";

export interface AuditEvent {
  id: string;
  kind: AuditKind;
  title: string;
  description: string;
  /** Who did it, e.g. "J. Mutua" or "System" */
  actor: string;
  /** ISO date-time */
  timestamp: string;
}

// ---- Duplicate review ----------------------------------------------------

export interface RequestSummary {
  reference: string;
  title: string;
  category: Category;
  county: string;
  /** ISO date */
  submittedOn: string;
}

export type DuplicateStatus = "needs-review" | "separate" | "escalated";

export interface DuplicatePair {
  id: string;
  status: DuplicateStatus;
  /** Why the system flagged the pair, e.g. "Same category" */
  signals: string[];
  a: RequestSummary;
  b: RequestSummary;
}

// ---- Request oversight ---------------------------------------------------

export type Priority = "Urgent" | "High priority" | "Standard";

export interface OversightRequest {
  reference: string;
  title: string;
  category: Category;
  county: string;
  agency: string;
  stage: LifecycleStage;
  priority: Priority;
  /** ISO date */
  updatedOn: string;
}

// ---- Dashboard -----------------------------------------------------------

export interface AdminMetric {
  label: string;
  value: string;
  note: string;
}
