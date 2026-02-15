"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, isLogged } = useSession();

  useEffect(() => {
    if (!loading && !isLogged) {
      window.location.href = "/login";
    }
  }, [loading, isLogged]);

  if (loading) return null;
  if (!isLogged) return null;

  return <>{children}</>;
}
