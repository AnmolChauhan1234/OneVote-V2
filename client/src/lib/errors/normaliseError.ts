import axios from "axios";

import { AppError } from "../errors/AppError";
import { ERROR_CODES, ErrorCode } from "../../constants/errorCodes";

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Prioritize backend structured error response
    const message = data?.message || data?.detail || error.message || "Request failed";
    const code = data?.error_code || (status === 401 ? ERROR_CODES.UNAUTHORIZED : 
                 status === 403 ? ERROR_CODES.FORBIDDEN : 
                 status === 404 ? ERROR_CODES.NOT_FOUND : 
                 status && status >= 500 ? ERROR_CODES.SERVER_ERROR : ERROR_CODES.UNKNOWN);

    return new AppError(
      message,
      status,
      code as ErrorCode
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("Something went wrong");
}