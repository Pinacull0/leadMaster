import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projects";

export async function list(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listProjects();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, description, status } = body as {
    name?: string;
    description?: string;
    status?: "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE";
  };

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = await createProject({
    name,
    description: description || null,
    status,
    created_by: auth.payload.userId,
  });

  return NextResponse.json({ id });
}

export async function getOne(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await getProject(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const affected = await updateProject(id, body);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const affected = await deleteProject(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}