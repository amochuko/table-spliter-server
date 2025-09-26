import jwt from "jsonwebtoken";
import env from "./env";
import { TokenPayload } from "../../types/express/token-payload";

export const parseIntSafe = (value: string): number | null => {
  if (/^(\d+)$/.test(value)) {
    return parseInt(value, 10);
  }

  return null;
};

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

// Session invite code

export const getInviteCode = () => {
  return Math.random().toString(36).slice(2, 8);
};
