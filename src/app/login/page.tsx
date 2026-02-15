"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Credenciais inválidas");
      return;
    }

    const data = await res.json();
    if (!data?.user) {
      setError("Resposta inválida do servidor");
      return;
    }
    window.location.href = "/projects";
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <div className="auth-head">
          <h1>AllManager</h1>
          <p>Acesse o painel com suas credenciais.</p>
        </div>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            Entrar
          </button>
          {error && <span className="error">{error}</span>}
        </form>
      </div>
    </section>
  );
}
