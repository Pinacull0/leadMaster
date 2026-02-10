"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch, getToken } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";
import RequireAuth from "@/components/RequireAuth";

type Note = {
  id: number;
  title: string;
  content: string;
};

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const role = useMemo(() => parseToken(getToken())?.role, []);
  const isAdmin = role === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/notes");
    if (!res.ok) {
      setError("Acesso somente para admin");
      setLoading(false);
      return;
    }
    setNotes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await authFetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      setError("Erro ao criar anotação");
      return;
    }

    setTitle("");
    setContent("");
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((prev) => prev.filter((item) => item.id !== id));
  }

  function openEdit(note: Note) {
    setEditing(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await authFetch(`/api/notes/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar anotação");
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
            <h1>Anotações</h1>
            <p>Registros e observações gerais do time.</p>
          </div>
          <div className="pill">{isAdmin ? "Admin" : "User"}</div>
        </header>

        {isAdmin && (
          <form className="card form" onSubmit={onCreate}>
            <div className="form-grid">
              <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input placeholder="Conteúdo" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <button className="btn" type="submit">
              Criar anotação
            </button>
            {error && <span className="error">{error}</span>}
          </form>
        )}

        {loading ? (
          <div className="empty">Carregando...</div>
        ) : (
          <div className="grid">
            {notes.map((note) => (
              <article className="card" key={note.id}>
                <div className="card-head">
                  <h3>{note.title}</h3>
                </div>
                <p>{note.content}</p>
                {isAdmin && (
                  <div className="card-actions">
                    <button className="btn ghost" onClick={() => openEdit(note)}>
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => onDelete(note.id)}>
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
                <h2>Editar anotação</h2>
                <button className="btn ghost" onClick={() => setEditing(null)}>
                  Fechar
                </button>
              </header>
              <form className="form" onSubmit={onUpdate}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                <input value={editContent} onChange={(e) => setEditContent(e.target.value)} required />
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
