import AppError, { AppErrorOptions } from "./app.error";
import { ErrorCodes } from "./error.codes";

interface NotNullConstraintErrorOption extends AppErrorOptions {
  extensions: {
    code: ErrorCodes;
    errors: {
      id?: string;
      entity: string;
    };
  };
}
export class NotNullConstraintError extends AppError {
  constructor(msg: string, options: NotNullConstraintErrorOption) {
    const { id, entity } = options.extensions.errors;
    msg = `${entity} cannot have a null for name`.trim();

    super(msg, options);
  }
}
