import pool from "@/utils/db";

export type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: "NEW" | "QUALIFIED" | "WON" | "LOST";
  notes: string | null;
  created_at: string;
};

export async function listLeads() {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, status, notes, created_at FROM leads ORDER BY id DESC"
  );
  return rows as Lead[];
}

export async function getLead(id: number) {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, status, notes, created_at FROM leads WHERE id = ?",
    [id]
  );
  const data = rows as Lead[];
  return data[0] || null;
}

export async function createLead(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  status?: Lead["status"];
  notes?: string | null;
}) {
  const [result] = await pool.query(
    "INSERT INTO leads (name, email, phone, status, notes) VALUES (?, ?, ?, ?, ?)",
    [input.name, input.email || null, input.phone || null, input.status || "NEW", input.notes || null]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateLead(id: number, input: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  status?: Lead["status"];
  notes?: string | null;
}) {
  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    values.push(input.name);
  }
  if (input.email !== undefined) {
    fields.push("email = ?");
    values.push(input.email);
  }
  if (input.phone !== undefined) {
    fields.push("phone = ?");
    values.push(input.phone);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    values.push(input.status);
  }
  if (input.notes !== undefined) {
    fields.push("notes = ?");
    values.push(input.notes);
  }

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE leads SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteLead(id: number) {
  const [result] = await pool.query("DELETE FROM leads WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}