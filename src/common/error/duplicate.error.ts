import AppError, { AppErrorOptions } from "./app.error";
import { ErrorCodes } from "./error.codes";

interface DuplicateErrorOptions extends AppErrorOptions {
  extensions: {
    code: ErrorCodes;
    errors: {
      id?: string;
      entity: string;
    };
  };
}
export class DuplicateError extends AppError {
  constructor(msg = "", options: DuplicateErrorOptions) {
    const { entity, id } = options.extensions.errors;
    msg += `${entity} with this name already exists`.trim();
    super(msg, options);
  }
}
