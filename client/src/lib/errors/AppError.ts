import {ERROR_CODES, ErrorCode } from "@/constants/errorCodes";

export class AppError extends Error {
  status?: number;
  code: ErrorCode;

  constructor(
    message: string,
    status?: number,
    code: ErrorCode = ERROR_CODES.UNKNOWN
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}