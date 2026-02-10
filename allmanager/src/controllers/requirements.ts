import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import {
  listRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "@/services/requirements";

export async function list(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await listRequirements();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { title, description, status } = body as {
    title?: string;
    description?: string | null;
    status?: "OPEN" | "IN_PROGRESS" | "DONE";
  };

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const id = await createRequirement({
    title,
    description: description || null,
    status,
    created_by: auth.payload.userId,
  });

  return NextResponse.json({ id });
}

export async function getOne(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await getRequirement(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const affected = await updateRequirement(id, body);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const affected = await deleteRequirement(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}