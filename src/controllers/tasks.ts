import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import { listTasksByProject, getTask, createTask, updateTask, deleteTask } from "@/services/tasks";
import { validateJsonRequest } from "@/utils/security";
import {
  normalizeDate,
  normalizeOptionalText,
  normalizePositiveInt,
  normalizeTaskPriority,
  normalizeTaskStatus,
  normalizeText,
} from "@/utils/validation";

export async function listByProject(req: NextRequest, projectId: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listTasksByProject(projectId);
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;

  const project_id = normalizePositiveInt(body.project_id);
  const title = normalizeText(body.title, 200);
  const description = normalizeOptionalText(body.description, 4000);
  const status =
    body.status === undefined ? undefined : (normalizeTaskStatus(body.status) ?? undefined);
  const priority =
    body.priority === undefined ? undefined : (normalizeTaskPriority(body.priority) ?? undefined);
  const assigned_to = body.assigned_to === undefined ? undefined : normalizePositiveInt(body.assigned_to);
  const due_date = body.due_date === undefined ? undefined : normalizeDate(body.due_date);

  if (!project_id || !title) {
    return NextResponse.json({ error: "project_id and title are required" }, { status: 400 });
  }
  if (body.status !== undefined && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (body.priority !== undefined && !priority) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }
  if (body.assigned_to !== undefined && body.assigned_to !== null && !assigned_to) {
    return NextResponse.json({ error: "Invalid assigned_to" }, { status: 400 });
  }
  if (body.due_date !== undefined && body.due_date !== null && !due_date) {
    return NextResponse.json({ error: "Invalid due_date" }, { status: 400 });
  }

  const id = await createTask({
    project_id,
    title,
    description,
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

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const input: {
    title?: string;
    description?: string | null;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigned_to?: number | null;
    due_date?: string | null;
  } = {};

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
    const status = normalizeTaskStatus(body.status);
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    input.status = status;
  }
  if (body.priority !== undefined) {
    const priority = normalizeTaskPriority(body.priority);
    if (!priority) return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    input.priority = priority;
  }
  if (body.assigned_to !== undefined) {
    if (body.assigned_to === null || body.assigned_to === "") {
      input.assigned_to = null;
    } else {
      const assignedTo = normalizePositiveInt(body.assigned_to);
      if (!assignedTo) return NextResponse.json({ error: "Invalid assigned_to" }, { status: 400 });
      input.assigned_to = assignedTo;
    }
  }
  if (body.due_date !== undefined) {
    if (body.due_date === null || body.due_date === "") {
      input.due_date = null;
    } else {
      const dueDate = normalizeDate(body.due_date);
      if (!dueDate) return NextResponse.json({ error: "Invalid due_date" }, { status: 400 });
      input.due_date = dueDate;
    }
  }

  const affected = await updateTask(id, input);
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
