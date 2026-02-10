import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export function getBearerToken(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookie = req.cookies.get("token");
  return cookie?.value || null;
}

export function requireAuth(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = verifyToken(token);
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