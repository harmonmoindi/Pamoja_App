import { clearToken, getToken } from "./tokenStorage";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";

/** Every failed request throws this. `code` matches the back-end error code, e.g. "email_taken". */
export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** The list format every paginated endpoint returns. */
export type Page<T> = { items: T[]; page: number; perPage: number; total: number };

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Query string values, e.g. { page: 1, role: "donor" }. Empty values are skipped. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Send the login token (default true). Use false for login and register. */
  auth?: boolean;
};

/**
 * Calls the back-end.  Usage:
 *   const page = await api<Page<User>>("/users", { params: { role: "donor" } });
 *   const result = await api<{ user: User }>("/auth/login", { method: "POST", body: { email, password }, auth: false });
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, params, auth = true } = options;

  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString() ? `?${search.toString()}` : "";

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}${query}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network_error", "Cannot reach the server. Is the back-end running?");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) clearToken(); // session expired or invalid
    const error = data?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "error",
      error?.message ?? "Something went wrong",
      error?.details ?? {},
    );
  }

  return data as T;
}
