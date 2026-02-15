import { getCsrfToken } from "@/utils/csrf-client";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  const method = (init?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
  }
  return fetch(input, { ...init, headers, credentials: "include" });
}

export async function logout() {
  await authFetch("/api/auth/logout", { method: "POST" });
}
