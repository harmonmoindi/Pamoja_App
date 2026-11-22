export type UserRole = "donor" | "beneficiary" | "agency" | "admin";

export type UserStatus = "active" | "pending" | "suspended";

export interface User {
  /** Number from the API (string in the old mock data) */
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  county: string | null;
  /** ISO date, e.g. "2026-09-14" */
  joinedOn: string;
  /** ISO date */
  lastActiveOn: string;
}
