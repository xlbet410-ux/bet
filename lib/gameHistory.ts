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

export type MyGameHistoryEntry = {
  id: string;
  gameName: string;
  betAmount: string;
  winAmount: string;
  net: string;
  createdAt: string;
};

export type MyGameHistoryPage = {
  total: number;
  games: MyGameHistoryEntry[];
};

export async function getMyGameHistory(page = 1, pageSize = 30): Promise<MyGameHistoryPage> {
  const res = await fetch(`${API_URL}/games/history?page=${page}&pageSize=${pageSize}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
