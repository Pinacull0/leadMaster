"use client";

import { useEffect } from "react";
import { getToken } from "@/utils/auth-client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return <>{children}</>;
}
