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

export async function sendKycOtp(phoneNumber: string): Promise<void> {
  const res = await fetch(`${API_URL}/otp/send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phoneNumber }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function verifyKycOtp(code: string): Promise<void> {
  const res = await fetch(`${API_URL}/otp/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}
