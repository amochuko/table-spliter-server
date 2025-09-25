/* eslint-disable no-unused-vars */
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Ensures a middleware always returns void and is typed as RequestHandler.
 */

export function createMiddleware(
  fn: (req: Request, res: Response, nxt: NextFunction) => void | Promise<void>
): RequestHandler {
  return (req, res, nxt) => {
    try {
      const result = fn(req, res, nxt);
      if (result instanceof Promise) {
        result.catch(nxt); // catch async errors and forward to Express
      }
    } catch (err) {
      nxt(err); // catch sync errors too
    }
  };
}
