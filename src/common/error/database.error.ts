import AppError, { AppErrorOptions } from "./app.error";

interface DatabaseErrorOptions extends AppErrorOptions {}

export class DatabaseError extends AppError {
  constructor(
    message = "A database error occcured",
    options?: DatabaseErrorOptions
  ) {
    super(message, options);
  }
}
