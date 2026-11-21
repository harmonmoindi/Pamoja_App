import { ApiError } from "./apiClient";

/** Turns any error into a short message a user can read. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Validation errors arrive as { "email": ["Not a valid email address."] }
    if (error.code === "validation_error") {
      const [field, messages] = Object.entries(error.details)[0] ?? [];
      if (field && Array.isArray(messages) && typeof messages[0] === "string") {
        return `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${messages[0]}`;
      }
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
