import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import envs from "../common/utils/env";
import { AuthUser } from "../types/auth";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: "Missing auth" });
    return;
  }

  const [, token] = header.split(" ");

  try {
    const payload = jwt.verify(token, envs.JWT_SECRET);

    if (typeof payload === "string") {
       res.status(401).json({ error: "Invalid token format!" });
    }

    console.log("authMiddleware: ", payload);
    req.user = payload as AuthUser;

    next();
  } catch (err) {
    console.error("authMiddleware: ", err);

    res.status(401).json({ error: "Invalid token!" });
    next(err);
  }
};
