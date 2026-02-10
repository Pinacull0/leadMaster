"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch, getToken } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";
import RequireAuth from "@/components/RequireAuth";

type Requirement = {
  id: number;
  title: string;
  description: string | null;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
};

export default function RequirementsView() {
  const [items, setItems] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Requirement["status"]>("OPEN");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Requirement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Requirement["status"]>("OPEN");

  const role = useMemo(() => parseToken(getToken())?.role, []);
  const isAdmin = role === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/requirements");
    if (!res.ok) {
      setError("Acesso somente para admin");
      setLoading(false);
      return;
    }
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await authFetch("/api/requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status }),
    });

    if (!res.ok) {
      setError("Erro ao criar requerimento");
      return;
    }

    setTitle("");
    setDescription("");
    setStatus("OPEN");
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/requirements/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function openEdit(item: Requirement) {
    setEditing(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditStatus(item.status);
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await authFetch(`/api/requirements/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        status: editStatus,
      }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar requerimento");
      return;
    }
    setEditing(null);
    await load();
  }

  return (
    <RequireAuth>
      <section className="view">
        <header className="view-header">
          <div>
            <h1>Requerimentos</h1>
            <p>Controle e priorização de necessidades do time.</p>
          </div>
          <div className="pill">{isAdmin ? "Admin" : "User"}</div>
        </header>

        {isAdmin && (
          <form className="card form" onSubmit={onCreate}>
            <div className="form-grid">
              <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select value={status} onChange={(e) => setStatus(e.target.value as Requirement["status"])}>
                <option value="OPEN">Aberto</option>
                <option value="IN_PROGRESS">Em progresso</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>
            <button className="btn" type="submit">
              Criar requerimento
            </button>
            {error && <span className="error">{error}</span>}
          </form>
        )}

        {loading ? (
          <div className="empty">Carregando...</div>
        ) : (
          <div className="grid">
            {items.map((req) => (
              <article className="card" key={req.id}>
                <div className="card-head">
                  <h3>{req.title}</h3>
                  <span className={`status ${req.status.toLowerCase()}`}>{req.status}</span>
                </div>
                <p>{req.description || "Sem descrição"}</p>
                {isAdmin && (
                  <div className="card-actions">
                    <button className="btn ghost" onClick={() => openEdit(req)}>
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => onDelete(req.id)}>
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
                <h2>Editar requerimento</h2>
                <button className="btn ghost" onClick={() => setEditing(null)}>
                  Fechar
                </button>
              </header>
              <form className="form" onSubmit={onUpdate}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Requirement["status"])}>
                  <option value="OPEN">Aberto</option>
                  <option value="IN_PROGRESS">Em progresso</option>
                  <option value="DONE">Concluído</option>
                </select>
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
