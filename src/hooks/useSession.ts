"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  id: number;
  role: "ADMIN" | "USER";
};

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!active) return;

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { user?: SessionUser };
      setUser(data.user || null);
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { loading, user, isAdmin: user?.role === "ADMIN", isLogged: Boolean(user) };
}
