"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch, getToken } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";
import RequireAuth from "@/components/RequireAuth";

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: "NEW" | "QUALIFIED" | "WON" | "LOST";
  notes: string | null;
};

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Lead["status"]>("NEW");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<Lead["status"]>("NEW");
  const [editNotes, setEditNotes] = useState("");

  const role = useMemo(() => parseToken(getToken())?.role, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/leads");
    if (!res.ok) {
      setError("Não foi possível carregar leads");
      setLoading(false);
      return;
    }
    setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await authFetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, status, notes }),
    });

    if (!res.ok) {
      setError("Erro ao criar lead");
      return;
    }

    setName("");
    setEmail("");
    setPhone("");
    setStatus("NEW");
    setNotes("");
    await load();
  }

  async function onDelete(id: number) {
    const res = await authFetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) setLeads((prev) => prev.filter((item) => item.id !== id));
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setEditName(lead.name);
    setEditEmail(lead.email || "");
    setEditPhone(lead.phone || "");
    setEditStatus(lead.status);
    setEditNotes(lead.notes || "");
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await authFetch(`/api/leads/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        notes: editNotes,
      }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar lead");
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
            <h1>Leads</h1>
            <p>Controle do funil e acompanhamento comercial.</p>
          </div>
          <div className="pill">{role === "ADMIN" ? "Admin" : "User"}</div>
        </header>

        <form className="card form" onSubmit={onCreate}>
          <div className="form-grid">
            <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value as Lead["status"])}>
              <option value="NEW">Novo</option>
              <option value="QUALIFIED">Qualificado</option>
              <option value="WON">Ganho</option>
              <option value="LOST">Perdido</option>
            </select>
            <input placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn" type="submit">
            Criar lead
          </button>
          {error && <span className="error">{error}</span>}
        </form>

        {loading ? (
          <div className="empty">Carregando...</div>
        ) : (
          <div className="grid">
            {leads.map((lead) => (
              <article className="card" key={lead.id}>
                <div className="card-head">
                  <h3>{lead.name}</h3>
                  <span className={`status ${lead.status.toLowerCase()}`}>{lead.status}</span>
                </div>
                <p>{lead.notes || "Sem notas"}</p>
                <div className="meta">
                  {lead.email && <span>{lead.email}</span>}
                  {lead.phone && <span>{lead.phone}</span>}
                </div>
                <div className="card-actions">
                  <button className="btn ghost" onClick={() => openEdit(lead)}>
                    Editar
                  </button>
                  <button className="btn danger" onClick={() => onDelete(lead.id)}>
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
                <h2>Editar lead</h2>
                <button className="btn ghost" onClick={() => setEditing(null)}>
                  Fechar
                </button>
              </header>
              <form className="form" onSubmit={onUpdate}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Lead["status"])}>
                  <option value="NEW">Novo</option>
                  <option value="QUALIFIED">Qualificado</option>
                  <option value="WON">Ganho</option>
                  <option value="LOST">Perdido</option>
                </select>
                <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
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
