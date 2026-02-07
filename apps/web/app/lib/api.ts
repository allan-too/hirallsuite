export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": "user-admin",
    "X-Branch-Id": "branch-main",
    "X-Device-Id": "device-web",
    ...(options.headers || {})
  };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json();
}
