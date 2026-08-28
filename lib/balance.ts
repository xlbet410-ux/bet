export const BALANCE_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

// Matches AuthService's own formatting for the /auth/me `balance` field —
// keeps the live-streamed value visually identical to the one the page
// first loads with.
export function formatBalance(raw: string): string {
  return `৳${Number(raw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function createBalanceStreamTicket(): Promise<string> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  const res = await fetch(`${BALANCE_API_URL}/balance/stream-ticket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Couldn't open a live wallet connection.");
  const data = await res.json();
  return data.ticket;
}
