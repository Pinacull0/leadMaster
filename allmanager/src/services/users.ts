import pool from "@/utils/db";

export type UserRole = "ADMIN" | "USER";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function getUserByEmail(email: string) {
  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const data = rows as Array<{ id: number; name: string; email: string; password_hash: string; role: UserRole }>;
  return data[0] || null;
}

export async function getUserById(id: number) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  const data = rows as Array<User>;
  return data[0] || null;
}

export async function listUsers() {
  const [rows] = await pool.query("SELECT id, name, email, role FROM users ORDER BY id DESC");
  return rows as User[];
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [input.name, input.email, input.passwordHash, input.role]
  );
  const info = result as { insertId: number };
  return info.insertId;
}

export async function updateUser(
  id: number,
  input: { name?: string; email?: string; role?: UserRole; passwordHash?: string }
) {
  const fields: string[] = [];
  const values: Array<string> = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    values.push(input.name);
  }
  if (input.email !== undefined) {
    fields.push("email = ?");
    values.push(input.email);
  }
  if (input.role !== undefined) {
    fields.push("role = ?");
    values.push(input.role);
  }
  if (input.passwordHash !== undefined) {
    fields.push("password_hash = ?");
    values.push(input.passwordHash);
  }

  if (fields.length === 0) return 0;

  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id]
  );
  const info = result as { affectedRows: number };
  return info.affectedRows;
}

export async function deleteUser(id: number) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  const info = result as { affectedRows: number };
  return info.affectedRows;
}
