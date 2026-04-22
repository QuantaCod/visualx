const API = "/api";

export async function adminLogin(password: string): Promise<boolean> {
  const r = await fetch(`${API}/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return r.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API}/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function adminMe(): Promise<boolean> {
  const r = await fetch(`${API}/admin/me`, { credentials: "include" });
  if (!r.ok) return false;
  const j = (await r.json()) as { authenticated: boolean };
  return Boolean(j.authenticated);
}
