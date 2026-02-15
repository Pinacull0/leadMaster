import jwt, { JwtPayload } from "jsonwebtoken";

export type AuthPayload = {
  userId: number;
  role: "ADMIN" | "USER";
};

const JWT_ALG = "HS256";
const EXPIRATION = "8h";
const JWT_ISSUER = process.env.JWT_ISSUER || "allmanager";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "allmanager-app";

export function signToken(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(payload, secret, {
    algorithm: JWT_ALG,
    expiresIn: EXPIRATION,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: String(payload.userId),
  });
}

export function verifyToken(token: string): AuthPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const decoded = jwt.verify(token, secret, {
    algorithms: [JWT_ALG],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as JwtPayload;

  const userId = Number(decoded.userId);
  const role = decoded.role;
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid token payload");
  }
  if (role !== "ADMIN" && role !== "USER") {
    throw new Error("Invalid token payload");
  }

  return {
    userId,
    role,
  };
}
