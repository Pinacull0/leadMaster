import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "am_auth";
export const CSRF_COOKIE_NAME = "am_csrf";
const MAX_JSON_BODY_BYTES = 64 * 1024;

function isHttps(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  return proto === "https" || process.env.NODE_ENV === "production";
}

export function isMutationMethod(method: string) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

export function setAuthCookies(req: NextRequest, res: NextResponse, token: string) {
  const secure = isHttps(req);
  const csrfToken = crypto.randomBytes(24).toString("hex");

  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: csrfToken,
    httpOnly: false,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export function clearAuthCookies(req: NextRequest, res: NextResponse) {
  const secure = isHttps(req);
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    expires: new Date(0),
  });
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: "",
    httpOnly: false,
    sameSite: "strict",
    secure,
    path: "/",
    expires: new Date(0),
  });
}

export function validateCsrf(req: NextRequest) {
  const headerToken = req.headers.get("x-csrf-token");
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!headerToken || !cookieToken) {
    return NextResponse.json({ error: "CSRF token missing" }, { status: 403 });
  }
  if (headerToken.length !== cookieToken.length) {
    return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
  }
  const a = Buffer.from(headerToken);
  const b = Buffer.from(cookieToken);
  if (!crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
  }
  return null;
}

export function validateSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!host) {
    return NextResponse.json({ error: "Invalid host" }, { status: 400 });
  }

  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 403 });
  }

  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  return null;
}

export function validateJsonRequest(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const rawLen = req.headers.get("content-length");
  if (rawLen) {
    const len = Number(rawLen);
    if (Number.isFinite(len) && len > MAX_JSON_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
  }

  return null;
}

export function parsePositiveIntId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}
