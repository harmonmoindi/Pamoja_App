import { api } from "@/lib/apiClient";
import { User } from "@/types/user";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "donor" | "beneficiary" | "agency";
  county?: string;
  /** Only for role "agency" */
  organizationName?: string;
};

export type AuthResponse = { user: User; token: string };

export function register(input: RegisterInput) {
  return api<AuthResponse>("/auth/register", { method: "POST", body: input, auth: false });
}

export function login(email: string, password: string) {
  return api<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });
}

export function fetchMe() {
  return api<{ user: User }>("/auth/me");
}
