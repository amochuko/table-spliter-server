import AppError from "./app.error";
import { DuplicateError } from "./duplicate.error";
import { ErrorCodes } from "./error.codes";
import { NotFoundError } from "./not-found.error";
import { NotNullConstraintError } from "./not-null-constraint.error";

export function catchErrorHandler(err: any, resource: string) {
  const pgCode = err?.code;
  const message = err?.message || "";

  if (err instanceof Error) {
    // TODO: attend to this later
    console.error(err);
  }

  if (pgCode === "23505" || /duplicate key value/gi.test(message)) {
    throw new DuplicateError(resource, {
      extensions: {
        code: ErrorCodes.DUPLICATE,
        errors: {
          entity: resource,
        },
      },
    });
  }

  if (pgCode === "23503") {
    throw new NotFoundError(resource, {
      extensions: {
        code: ErrorCodes.NOT_FOUND,
        errors: {
          entity: resource,
        },
      },
    });
  }

  if (pgCode === "23502") {
    throw new NotNullConstraintError(err.message, {
      extensions: {
        code: ErrorCodes.NONE_NULL,
        errors: {
          entity: resource,
        },
      },
    });
  }

  // Default fallback
  return new AppError(
    `Unexpected error occurred while working with ${resource}.`,
    {
      extensions: {
        code: ErrorCodes.APP_ERROR,
        errors: {
          resource,
        },
      },
    }
  );
}
