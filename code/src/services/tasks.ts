import pool from "@/utils/db";

export type Task = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigned_to: number | null;
  due_date: string | null;
  created_at: string;
};

export async function listTasksByProject(projectId: number) {
  const [rows] = await pool.query(
    "SELECT id, project_id, title, description, status, priority, assigned_to, due_date, created_at FROM tasks WHERE project_id = ? ORDER BY id DESC",
    [projectId]
  );
  return rows as Task[];
}

export async function getTask(id: number) {
  const [rows] = await pool.query(
    "SELECT id, project_id, title, description, status, priority, assigned_to, due_date, created_at FROM tasks WHERE id = ?",
    [id]
  );
  const data = rows as Task[];
  return data[0] || null;
}

export async function createTask(input: {
  project_id: number;
  title: string;
  description?: string | null;
  status?: Task["status"];
  priority?: Task["priority"];
  assigned_to?: number | null;
  due_date?: string | null;
}) {
  const [result] = await pool.query(
    "INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      input.project_id,
      input.title,
      input.description || null,
      input.status || "TODO",
      input.priority || "MEDIUM",
      input.assigned_to || null,
      input.due_date || null,
    ]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateTask(id: number, input: {
  title?: string;
  description?: string | null;
  status?: Task["status"];
  priority?: Task["priority"];
  assigned_to?: number | null;
  due_date?: string | null;
}) {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.title !== undefined) {
    fields.push("title = ?");
    values.push(input.title);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    values.push(input.description);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    values.push(input.status);
  }
  if (input.priority !== undefined) {
    fields.push("priority = ?");
    values.push(input.priority);
  }
  if (input.assigned_to !== undefined) {
    fields.push("assigned_to = ?");
    values.push(input.assigned_to);
  }
  if (input.due_date !== undefined) {
    fields.push("due_date = ?");
    values.push(input.due_date);
  }

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteTask(id: number) {
  const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}