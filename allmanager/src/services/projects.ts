import pool from "@/utils/db";

export type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE";
  created_by: number;
  created_at: string;
};

export async function listProjects() {
  const [rows] = await pool.query(
    "SELECT id, name, description, status, created_by, created_at FROM projects ORDER BY id DESC"
  );
  return rows as Project[];
}

export async function getProject(id: number) {
  const [rows] = await pool.query(
    "SELECT id, name, description, status, created_by, created_at FROM projects WHERE id = ?",
    [id]
  );
  const data = rows as Project[];
  return data[0] || null;
}

export async function createProject(input: {
  name: string;
  description?: string | null;
  status?: Project["status"];
  created_by: number;
}) {
  const [result] = await pool.query(
    "INSERT INTO projects (name, description, status, created_by) VALUES (?, ?, ?, ?)",
    [input.name, input.description || null, input.status || "ACTIVE", input.created_by]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateProject(id: number, input: {
  name?: string;
  description?: string | null;
  status?: Project["status"];
}) {
  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    values.push(input.description);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    values.push(input.status);
  }

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteProject(id: number) {
  const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}