import axios from "axios";

import { AppError } from "../errors/AppError";
import { ERROR_CODES, ErrorCode } from "../../constants/errorCodes";

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    let code: ErrorCode = ERROR_CODES.UNKNOWN;

    if (status === 401) code = ERROR_CODES.UNAUTHORIZED;
    else if (status === 403) code = ERROR_CODES.FORBIDDEN;
    else if (status === 404) code = ERROR_CODES.NOT_FOUND;
    else if (status && status >= 500) code = ERROR_CODES.SERVER_ERROR;

    return new AppError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Request failed",
      status,
      code
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("Something went wrong");
}