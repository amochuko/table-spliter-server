import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import envs from "../common/utils/env";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Missing auth" });
  }

  const [, token] = header.split(" ");

  try {
    const payload = jwt.verify(token, envs.JWT_SECRET);
    req.user = payload;

    next();
  } catch (err) {
    console.error("authMiddleware: ", err);

    res.status(401).json({ error: "Invalid token!" });
  }
};
