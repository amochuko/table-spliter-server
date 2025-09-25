import { ErrorCodes } from "./error.codes";

// TODO: Update AppError to use this format
export interface AppErrorOptions {
  extensions: {
    code: ErrorCodes;
    statusCode?: number;
    errors: Record<string, any>;
  };
}

export default class AppError extends Error {
  public code: ErrorCodes;
  public readonly name: string;
  public readonly statusCode: number;

  constructor(message: string, options?: AppErrorOptions) {
    super(message);
    this.code = options?.extensions.code || ErrorCodes.UNKNOWN;
    this.statusCode = options?.extensions.statusCode || 500;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}
