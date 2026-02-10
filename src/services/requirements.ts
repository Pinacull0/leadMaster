import pool from "@/utils/db";

export type Requirement = {
  id: number;
  title: string;
  description: string | null;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  created_by: number;
  created_at: string;
};

export async function listRequirements() {
  const [rows] = await pool.query(
    "SELECT id, title, description, status, created_by, created_at FROM requirements ORDER BY id DESC"
  );
  return rows as Requirement[];
}

export async function getRequirement(id: number) {
  const [rows] = await pool.query(
    "SELECT id, title, description, status, created_by, created_at FROM requirements WHERE id = ?",
    [id]
  );
  const data = rows as Requirement[];
  return data[0] || null;
}

export async function createRequirement(input: {
  title: string;
  description?: string | null;
  status?: Requirement["status"];
  created_by: number;
}) {
  const [result] = await pool.query(
    "INSERT INTO requirements (title, description, status, created_by) VALUES (?, ?, ?, ?)",
    [input.title, input.description || null, input.status || "OPEN", input.created_by]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateRequirement(id: number, input: {
  title?: string;
  description?: string | null;
  status?: Requirement["status"];
}) {
  const fields: string[] = [];
  const values: Array<string | null> = [];

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

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE requirements SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteRequirement(id: number) {
  const [result] = await pool.query("DELETE FROM requirements WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}