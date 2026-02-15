import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import { listNotes, getNote, createNote, updateNote, deleteNote } from "@/services/notes";
import { validateJsonRequest } from "@/utils/security";
import { normalizeText } from "@/utils/validation";

export async function list(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await listNotes();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const title = normalizeText(body.title, 200);
  const content = normalizeText(body.content, 8000);

  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const id = await createNote({ title, content, created_by: auth.payload.userId });
  return NextResponse.json({ id });
}

export async function getOne(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const data = await getNote(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const input: { title?: string; content?: string } = {};

  if (body.title !== undefined) {
    const title = normalizeText(body.title, 200);
    if (!title) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    input.title = title;
  }
  if (body.content !== undefined) {
    const content = normalizeText(body.content, 8000);
    if (!content) return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    input.content = content;
  }

  const affected = await updateNote(id, input);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const affected = await deleteNote(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
