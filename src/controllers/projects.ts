import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projects";
import { validateJsonRequest } from "@/utils/security";
import { normalizeOptionalText, normalizeProjectStatus, normalizeText } from "@/utils/validation";

export async function list(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listProjects();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const name = normalizeText(body.name, 160);
  const description = normalizeOptionalText(body.description, 4000);
  const status = body.status === undefined ? undefined : normalizeProjectStatus(body.status);

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (body.status !== undefined && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const id = await createProject({
    name,
    description,
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

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const input: { name?: string; description?: string | null; status?: "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE" } =
    {};

  if (body.name !== undefined) {
    const name = normalizeText(body.name, 160);
    if (!name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    input.name = name;
  }
  if (body.description !== undefined) {
    const description = normalizeOptionalText(body.description, 4000);
    if (body.description !== null && !description) {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
    input.description = description;
  }
  if (body.status !== undefined) {
    const status = normalizeProjectStatus(body.status);
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    input.status = status;
  }

  const affected = await updateProject(id, input);
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
