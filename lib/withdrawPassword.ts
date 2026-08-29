const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function parseApiError(res: Response) {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {}
  return "Something went wrong. Please try again.";
}

export async function getWithdrawPasswordStatus(): Promise<{ isSet: boolean }> {
  const res = await fetch(`${API_URL}/auth/withdraw-password/status`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

// oldPassword is required by the backend only once a withdrawal password
// already exists (see AuthService.setWithdrawPassword) — omit it entirely
// for the first-time "set" flow.
export async function setWithdrawPassword(input: { oldPassword?: string; newPassword: string }): Promise<void> {
  const res = await fetch(`${API_URL}/auth/withdraw-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}
