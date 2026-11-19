export type UserRole = "donor" | "beneficiary" | "agency" | "admin";

export type UserStatus = "active" | "pending" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  county: string;
  /** ISO date, e.g. "2026-09-14" */
  joinedOn: string;
  /** ISO date */
  lastActiveOn: string;
}
