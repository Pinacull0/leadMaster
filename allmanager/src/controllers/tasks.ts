import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import { listTasksByProject, getTask, createTask, updateTask, deleteTask } from "@/services/tasks";

export async function listByProject(req: NextRequest, projectId: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listTasksByProject(projectId);
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { project_id, title, description, status, priority, assigned_to, due_date } = body as {
    project_id?: number;
    title?: string;
    description?: string | null;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigned_to?: number | null;
    due_date?: string | null;
  };

  if (!project_id || !title) {
    return NextResponse.json({ error: "project_id and title are required" }, { status: 400 });
  }

  const id = await createTask({
    project_id,
    title,
    description: description || null,
    status,
    priority,
    assigned_to: assigned_to || null,
    due_date: due_date || null,
  });

  return NextResponse.json({ id });
}

export async function getOne(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await getTask(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const affected = await updateTask(id, body);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const affected = await deleteTask(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}