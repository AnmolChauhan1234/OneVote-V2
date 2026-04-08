import { toast } from "sonner";
import { normalizeError } from "../errors/normaliseError";
import { ERROR_CODES } from "@/constants/errorCodes";

export function handleError(error: unknown): void {
  const appError = normalizeError(error);

  console.error("Error:", error);

  // Auth handling
  if (appError.code === ERROR_CODES.UNAUTHORIZED) {
    toast.error("Session expired. Please login again.");

    // Optional: redirect/logout
    // window.location.href = "/login";
    return;
  }

  // Forbidden
  if (appError.code === ERROR_CODES.FORBIDDEN) {
    toast.error("You don’t have permission to do this.");
    return;
  }

  // Default
  toast.error(appError.message);
}