"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/utils/auth-client";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useSession } from "@/hooks/useSession";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  due_date: string | null;
};

type Props = {
  projectId: number;
};

export default function TasksView({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("TODO");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("MEDIUM");
  const [editDueDate, setEditDueDate] = useState("");

  const { isAdmin } = useSession();

  const load = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError("Projeto inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await authFetch(`/api/projects/${projectId}/tasks`);
    if (!res.ok) {
      setError("Não foi possível carregar as tarefas");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError("Projeto inválido");
      return;
    }

    const res = await authFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, title, description, status, priority }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Erro ao criar tarefa");
      return;
    }

    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    await load();
  }

  function openTask(task: Task) {
    setSelected(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDueDate(task.due_date || "");
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const res = await authFetch(`/api/tasks/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        due_date: editDueDate || null,
      }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar tarefa");
      return;
    }
    setSelected(null);
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelected(null);
    }
  }

  return (
    <RequireAuth>
      <section className="view">
        <header className="view-header">
          <div>
            <h1>Tarefas</h1>
            <p>Organize e acompanhe as tasks do projeto.</p>
          </div>
          <Link className="btn ghost" href="/projects">
            Voltar
          </Link>
        </header>

        {isAdmin && (
          <form className="card form" onSubmit={onCreate}>
            <div className="form-grid">
              <input
                placeholder="Título da task"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])}>
                <option value="TODO">A Fazer</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="REVIEW">Revisão</option>
                <option value="DONE">Concluída</option>
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <button className="btn" type="submit">
              Criar task
            </button>
            {error && <span className="error">{error}</span>}
          </form>
        )}

        {loading ? (
          <div className="empty">Carregando...</div>
        ) : (
          <div className="columns">
            {tasks.map((task) => (
              <button key={task.id} className="card task" onClick={() => openTask(task)}>
                <div className="card-head">
                  <h3>{task.title}</h3>
                  <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
                </div>
                <p>{task.description || "Sem descrição"}</p>
                <div className="meta">
                  <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  {task.due_date && <span>Entrega: {task.due_date}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header>
                <h2>{selected.title}</h2>
                <button className="btn ghost" onClick={() => setSelected(null)}>
                  Fechar
                </button>
              </header>
              <p>{selected.description || "Sem descrição"}</p>
              <div className="meta">
                <span className={`status ${selected.status.toLowerCase()}`}>{selected.status}</span>
                <span className={`priority ${selected.priority.toLowerCase()}`}>{selected.priority}</span>
                {selected.due_date && <span>Entrega: {selected.due_date}</span>}
              </div>

              {isAdmin && (
                <form className="form" onSubmit={onUpdate}>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Task["status"])}>
                    <option value="TODO">A Fazer</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="REVIEW">Revisão</option>
                    <option value="DONE">Concluída</option>
                  </select>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Task["priority"])}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                  <div className="card-actions">
                    <button className="btn" type="submit">
                      Salvar
                    </button>
                    <button className="btn danger" type="button" onClick={() => onDelete(selected.id)}>
                      Excluir
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
