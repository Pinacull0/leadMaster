import { NextRequest, NextResponse } from "next/server";

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  for (const [name, value] of Object.entries(securityHeaders)) {
    res.headers.set(name, value);
  }

  const proto = req.headers.get("x-forwarded-proto");
  if (proto === "https") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
