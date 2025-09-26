import "express";

declare global {
  namespace Express {
    interface Request {
      user?: import("../../types/auth").AuthUser;
    }
  }
}
