import AppError, { AppErrorOptions } from "./app.error";

interface AuthorizationErrorOptions extends AppErrorOptions {}

export default class AuthorizationError extends AppError {
  constructor(msg = "Not Authorized", options: AuthorizationErrorOptions) {
    super(msg, options);
  }
}
