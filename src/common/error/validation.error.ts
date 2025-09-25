import AppError, { AppErrorOptions } from "./app.error";

// TODO: Update AppError to use this format
interface ValidationErrorOptions extends AppErrorOptions {}

/**
 * This is the ValidationError used to handle neccessary exception
 */
export default class ValidationError extends AppError {
  constructor(
    msg: string = "Invalid data provided",
    options?: ValidationErrorOptions
  ) {
    super(msg, options);
  }
}
