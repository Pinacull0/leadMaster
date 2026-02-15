import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import { listUsers, updateUser, deleteUser, getUserByEmail, getUserById } from "@/services/users";
import { hashPassword } from "@/utils/password";
import { validateJsonRequest } from "@/utils/security";
import { normalizeEmail, normalizeRole, normalizeText, validateStrongPassword } from "@/utils/validation";

export async function list(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await listUsers();
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const name = body.name === undefined ? undefined : normalizeText(body.name, 120);
  const email = body.email === undefined ? undefined : normalizeEmail(body.email);
  const role = body.role === undefined ? undefined : normalizeRole(body.role);
  const password = body.password === undefined ? undefined : validateStrongPassword(body.password);

  if (body.name !== undefined && !name) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (body.email !== undefined && !email) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (body.role !== undefined && !role) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (body.password !== undefined && !password) {
    return NextResponse.json({ error: "Password does not meet policy" }, { status: 400 });
  }

  if (email) {
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const input: { name?: string; email?: string; role?: "ADMIN" | "USER"; passwordHash?: string } = {
    name,
    email,
    role,
  };

  if (password) {
    input.passwordHash = await hashPassword(password);
  }

  const affected = await updateUser(id, input);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  if (auth.payload.userId === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const target = await getUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const admins = await listUsers();
    const activeAdmins = admins.filter((user) => user.role === "ADMIN");
    if (activeAdmins.length <= 1) {
      return NextResponse.json({ error: "At least one admin account is required" }, { status: 400 });
    }
  }

  const affected = await deleteUser(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
