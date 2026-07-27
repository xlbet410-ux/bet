export type GameProvider = {
  id: number;
  code: string;
  name: string;
  image: string | null;
  status: number;
};

export type ProviderGame = {
  name: string;
  game_uid: string;
  provider: string;
  category: string;
  original: string;
  height: string;
  thumbnail: string;
  status: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

export async function getProviders(): Promise<GameProvider[]> {
  try {
    const res = await fetch(`${API_URL}/games/providers`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.filter((p: GameProvider) => p.status === 1) : [];
  } catch {
    return [];
  }
}

export async function getProviderGames(code: string): Promise<ProviderGame[]> {
  try {
    const res = await fetch(`${API_URL}/games/providers/${encodeURIComponent(code)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.games) ? data.games.filter((g: ProviderGame) => g.status === 1) : [];
  } catch {
    return [];
  }
}

export async function launchGame(gameUid: string): Promise<{ gameUrl: string }> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");

  const res = await fetch(`${API_URL}/games/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ gameUid }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Couldn't launch this game right now.");
  }
  return res.json();
}
