import AppError from "../../error/app.error";
import { ErrorCodes } from "../../error/error.codes";

export function handlePostgresError(err: any, entity = "ENTITY") {
  const pgCode = err?.code;
  const message = err?.message || "";

  if (pgCode === "23505" || /duplicate key value/gi.test(message)) {
    return new AppError(`${entity} with this name already exists.`, {
      extensions: {
        code: ErrorCodes.DUPLICATE,
        errors: {},
      },
    });
  }

  if (pgCode === "23503") {
    return new AppError(
      "Foreign key constraint failed. Related entity not found.",
      {
        extensions: {
          code: ErrorCodes.NOT_FOUND,
          statusCode: 400,
          errors: {},
        },
      }
    );
  }

  if (pgCode === "23502") {
    return new AppError("A required field is missing or null.", {
      extensions: {
        code: ErrorCodes.VALIDATION_ERROR,
        errors: {},
      },
    });
  }

  // Default fallback
  return new AppError(
    `Unexpected error occurred while working with ${entity}.`,
    {
      extensions: {
        code: ErrorCodes.SERVER_ERROR,
        errors: {},
      },
    }
  );
}
