import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/utils/jwt";
import { getUserByEmail, createUser, getUserById, UserRole } from "@/services/users";
import { hashPassword, verifyPassword } from "@/utils/password";
import { requireAdmin, requireAuth } from "@/middleware/auth";
import {
  clearAuthCookies,
  getClientIp,
  setAuthCookies,
  validateCsrf,
  validateJsonRequest,
  validateSameOrigin,
} from "@/utils/security";
import {
  normalizeEmail,
  normalizeRole,
  normalizeText,
  validateStrongPassword,
} from "@/utils/validation";
import {
  canAttemptLogin,
  clearFailedLogins,
  loginRateLimitKey,
  registerFailedLogin,
} from "@/utils/rate-limit";

const DUMMY_BCRYPT_HASH = "$2b$12$frq5xrc7Q2fHT2y8xjjyceQoqS/JvQ58m3z5hLhTJj10QOUfDR6RO";

export async function login(req: NextRequest) {
  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;

  const body = (await req.json()) as { email?: string; password?: string };
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : null;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limitKey = loginRateLimitKey(ip, email);
  const canTry = canAttemptLogin(limitKey);
  if (!canTry.allowed) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(canTry.retryAfterSec) },
      }
    );
  }

  const user = await getUserByEmail(email);
  if (!user) {
    await verifyPassword(password, DUMMY_BCRYPT_HASH);
    registerFailedLogin(limitKey);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    registerFailedLogin(limitKey);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearFailedLogins(limitKey);
  const token = signToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  setAuthCookies(req, response, token);
  return response;
}

export async function logout(req: NextRequest) {
  const originError = validateSameOrigin(req);
  if (originError) return originError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(req, response);
  return response;
}

export async function session(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const user = await getUserById(auth.payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: user.id, role: user.role },
  });
}

export async function createUserByAdmin(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const password = validateStrongPassword(body.password);
  const role = normalizeRole(body.role);

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: "Invalid payload: name, email, strong password and role are required" },
      { status: 400 }
    );
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = await createUser({ name, email, passwordHash, role });

  return NextResponse.json({ id, name, email, role });
}
