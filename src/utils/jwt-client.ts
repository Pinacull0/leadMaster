export type ClientAuthPayload = {
  userId: number;
  role: "ADMIN" | "USER";
  exp?: number;
};

export function parseToken(token: string | null): ClientAuthPayload | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      userId: Number(decoded.userId),
      role: decoded.role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}
