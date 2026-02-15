import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import {
  listRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "@/services/requirements";
import { validateJsonRequest } from "@/utils/security";
import { normalizeOptionalText, normalizeRequirementStatus, normalizeText } from "@/utils/validation";

export async function list(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await listRequirements();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const title = normalizeText(body.title, 200);
  const description = normalizeOptionalText(body.description, 4000);
  const status = body.status === undefined ? undefined : normalizeRequirementStatus(body.status);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (body.status !== undefined && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const id = await createRequirement({
    title,
    description,
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

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const input: { title?: string; description?: string | null; status?: "OPEN" | "IN_PROGRESS" | "DONE" } = {};

  if (body.title !== undefined) {
    const title = normalizeText(body.title, 200);
    if (!title) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    input.title = title;
  }
  if (body.description !== undefined) {
    const description = normalizeOptionalText(body.description, 4000);
    if (body.description !== null && !description) {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
    input.description = description;
  }
  if (body.status !== undefined) {
    const status = normalizeRequirementStatus(body.status);
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    input.status = status;
  }

  const affected = await updateRequirement(id, input);
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
