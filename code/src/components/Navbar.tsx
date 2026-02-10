"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken, getToken } from "@/utils/auth-client";
import { parseToken } from "@/utils/jwt-client";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const token = getToken();
  const isLogged = Boolean(token);
  const role = parseToken(token)?.role;

  return (
    <header className="nav">
      <div className="nav-brand">AllManager</div>
      <nav className="nav-links">
        <Link href="/projects">Projetos</Link>
        <Link href="/leads">Leads</Link>
        <Link href="/notes">Anotações</Link>
        <Link href="/requirements">Requerimentos</Link>
        {role === "ADMIN" && <Link href="/users">Usuários</Link>}
      </nav>
      <div className="nav-actions">
        {isLogged ? (
          <button
            className="btn ghost"
            onClick={() => {
              clearToken();
              window.location.href = "/login";
            }}
          >
            Sair
          </button>
        ) : (
          <Link className="btn" href="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
