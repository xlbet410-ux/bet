export type CashbackHistoryEntry = {
  date: string;
  netLoss: string;
  rate: string;
  amount: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

export async function getCashbackHistory(): Promise<CashbackHistoryEntry[]> {
  const res = await fetch(`${API_URL}/cashback/history`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load cashback history.");
  return res.json();
}
