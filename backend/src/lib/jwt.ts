import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errors";

export type JwtPayload = {
  sub: string;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded !== "object" || decoded === null || !("sub" in decoded) || !("email" in decoded)) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid token payload");
    }
    return {
      sub: String((decoded as JwtPayload).sub),
      email: String((decoded as JwtPayload).email),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
}
