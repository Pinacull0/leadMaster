import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import {
  AUTH_COOKIE_NAME,
  isMutationMethod,
  validateCsrf,
  validateSameOrigin,
} from "@/utils/security";

export function getBearerToken(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

function getCookieToken(req: NextRequest) {
  return req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

export function requireAuth(req: NextRequest) {
  const bearerToken = getBearerToken(req);
  const cookieToken = getCookieToken(req);
  const token = bearerToken || cookieToken;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = verifyToken(token);

    // For cookie-based auth, enforce CSRF and origin checks on state-changing methods.
    if (!bearerToken && isMutationMethod(req.method)) {
      const csrfError = validateCsrf(req);
      if (csrfError) return { error: csrfError };

      const originError = validateSameOrigin(req);
      if (originError) return { error: originError };
    }

    return { payload };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

export function requireAdmin(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth;
  if (auth.payload.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return auth;
}
