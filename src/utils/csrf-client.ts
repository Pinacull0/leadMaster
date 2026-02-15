export function getCsrfToken() {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("am_csrf="));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice("am_csrf=".length));
}
