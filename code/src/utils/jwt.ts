import jwt, { JwtPayload } from "jsonwebtoken";

export type AuthPayload = {
  userId: number;
  role: "ADMIN" | "USER";
};

const JWT_ALG = "HS256";
const EXPIRATION = "25d";

export function signToken(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(payload, secret, { algorithm: JWT_ALG, expiresIn: EXPIRATION });
}

export function verifyToken(token: string): AuthPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALG] }) as JwtPayload;
  return {
    userId: Number(decoded.userId),
    role: decoded.role as "ADMIN" | "USER",
  };
}