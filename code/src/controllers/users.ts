import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import { listUsers, updateUser, deleteUser, getUserByEmail } from "@/services/users";
import { hashPassword } from "@/utils/password";

export async function list(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await listUsers();
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, email, role, password } = body as {
    name?: string;
    email?: string;
    role?: "ADMIN" | "USER";
    password?: string;
  };

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

  const affected = await deleteUser(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
