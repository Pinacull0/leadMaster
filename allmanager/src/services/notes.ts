import pool from "@/utils/db";

export type Note = {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_at: string;
};

export async function listNotes() {
  const [rows] = await pool.query(
    "SELECT id, title, content, created_by, created_at FROM notes ORDER BY id DESC"
  );
  return rows as Note[];
}

export async function getNote(id: number) {
  const [rows] = await pool.query(
    "SELECT id, title, content, created_by, created_at FROM notes WHERE id = ?",
    [id]
  );
  const data = rows as Note[];
  return data[0] || null;
}

export async function createNote(input: {
  title: string;
  content: string;
  created_by: number;
}) {
  const [result] = await pool.query(
    "INSERT INTO notes (title, content, created_by) VALUES (?, ?, ?)",
    [input.title, input.content, input.created_by]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateNote(id: number, input: { title?: string; content?: string }) {
  const fields: string[] = [];
  const values: Array<string> = [];

  if (input.title !== undefined) {
    fields.push("title = ?");
    values.push(input.title);
  }
  if (input.content !== undefined) {
    fields.push("content = ?");
    values.push(input.content);
  }

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE notes SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteNote(id: number) {
  const [result] = await pool.query("DELETE FROM notes WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}