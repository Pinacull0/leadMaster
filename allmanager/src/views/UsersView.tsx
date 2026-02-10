"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch, getToken } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";
import RequireAuth from "@/components/RequireAuth";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("USER");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<User["role"]>("USER");
  const [editPassword, setEditPassword] = useState("");

  const roleToken = useMemo(() => parseToken(getToken())?.role, []);
  const isAdmin = roleToken === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/users");
    if (!res.ok) {
      setError("Acesso somente para admin");
      setLoading(false);
      return;
    }
    setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await authFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      setError("Erro ao criar usuário");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    await load();
  }

  function openEdit(user: User) {
    setEditing(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const res = await authFetch(`/api/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        role: editRole,
        password: editPassword || undefined,
      }),
    });

    if (!res.ok) {
      setError("Erro ao atualizar usuário");
      return;
    }

    setEditing(null);
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <RequireAuth>
      <section className="view">
        <header className="view-header">
          <div>
            <h1>Usuários</h1>
            <p>Gerencie acessos e permissões.</p>
          </div>
          <div className="pill">{isAdmin ? "Admin" : "User"}</div>
        </header>

        {isAdmin && (
          <form className="card form" onSubmit={onCreate}>
            <div className="form-grid">
              <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setRole(e.target.value as User["role"])}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button className="btn" type="submit">
              Criar usuário
            </button>
            {error && <span className="error">{error}</span>}
          </form>
        )}

        {loading ? (
          <div className="empty">Carregando...</div>
        ) : (
          <div className="grid">
            {users.map((user) => (
              <article className="card" key={user.id}>
                <div className="card-head">
                  <h3>{user.name}</h3>
                  <span className="pill">{user.role}</span>
                </div>
                <p>{user.email}</p>
                {isAdmin && (
                  <div className="card-actions">
                    <button className="btn ghost" onClick={() => openEdit(user)}>
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => onDelete(user.id)}>
                      Excluir
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {editing && (
          <div className="modal-backdrop" onClick={() => setEditing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header>
                <h2>Editar usuário</h2>
                <button className="btn ghost" onClick={() => setEditing(null)}>
                  Fechar
                </button>
              </header>
              <form className="form" onSubmit={onUpdate}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                <select value={editRole} onChange={(e) => setEditRole(e.target.value as User["role"])}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <input
                  placeholder="Nova senha (opcional)"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <button className="btn" type="submit">
                  Salvar
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
