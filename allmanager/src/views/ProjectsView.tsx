"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";
import { getToken } from "@/utils/auth-client";
import RequireAuth from "@/components/RequireAuth";

type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE";
};

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project["status"]>("ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Project["status"]>("ACTIVE");

  const token = getToken();
  const auth = parseToken(token);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/projects");
    if (!res.ok) {
      setError("Não foi possível carregar projetos");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await authFetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, status }),
    });

    if (!res.ok) {
      setError("Erro ao criar projeto");
      return;
    }

    setName("");
    setDescription("");
    setStatus("ACTIVE");
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function openEdit(project: Project) {
    setEditing(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStatus(project.status);
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await authFetch(`/api/projects/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        description: editDescription,
        status: editStatus,
      }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar projeto");
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
          <h1>Projetos</h1>
          <p>Visão geral dos projetos e acesso rápido às tarefas.</p>
        </div>
        <div className="pill">{auth?.role === "ADMIN" ? "Admin" : "User"}</div>
      </header>

      <form className="card form" onSubmit={onCreate}>
        <div className="form-grid">
          <input
            placeholder="Nome do projeto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])}>
            <option value="ACTIVE">Ativo</option>
            <option value="PLANNED">Planejado</option>
            <option value="ON_HOLD">Pausado</option>
            <option value="DONE">Concluído</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Criar projeto
        </button>
        {error && <span className="error">{error}</span>}
      </form>

      {loading ? (
        <div className="empty">Carregando...</div>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <article className="card" key={project.id}>
              <div className="card-head">
                <h3>{project.name}</h3>
                <span className={`status ${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              <p>{project.description || "Sem descrição"}</p>
              <div className="card-actions">
                <Link className="btn ghost" href={`/projects/${project.id}/tasks`}>
                  Ver tarefas
                </Link>
                <button className="btn ghost" onClick={() => openEdit(project)}>
                  Editar
                </button>
                <button className="btn danger" onClick={() => onDelete(project.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>Editar projeto</h2>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Fechar
              </button>
            </header>
            <form className="form" onSubmit={onUpdate}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Project["status"])}>
                <option value="ACTIVE">Ativo</option>
                <option value="PLANNED">Planejado</option>
                <option value="ON_HOLD">Pausado</option>
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
