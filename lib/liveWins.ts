const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LiveWin = { name: string; game: string; amount: string; value: number };

// Public route — real, recent net wins across all players. Empty until
// enough real play has happened; callers fall back to placeholder rows.
export async function getLiveWins(): Promise<LiveWin[]> {
  const res = await fetch(`${API_URL}/games/live-wins`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load live wins (${res.status})`);
  return res.json();
}
