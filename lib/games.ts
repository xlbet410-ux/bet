const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

export type GameCategory =
  | "slots"
  | "live-games"
  | "sports"
  | "esports"
  | "mini-game"
  | "fish-catch"
  | "table-games"
  | "arcade"
  | "other";

export const CATEGORY_ORDER: GameCategory[] = [
  "slots",
  "live-games",
  "sports",
  "esports",
  "mini-game",
  "fish-catch",
  "table-games",
  "arcade",
  "other",
];

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  slots: "Slots",
  "live-games": "Live Games",
  sports: "Sports",
  esports: "Esports",
  "mini-game": "Mini Game",
  "fish-catch": "Fish Catch",
  "table-games": "Table Games",
  arcade: "Arcade",
  other: "Other",
};

export const CATEGORY_ACCENT: Record<GameCategory, { from: string; to: string }> = {
  slots: { from: "#D4AF37", to: "#F5C842" },
  "live-games": { from: "#0F9D58", to: "#34D399" },
  sports: { from: "#1D4ED8", to: "#60A5FA" },
  esports: { from: "#7B2FBE", to: "#C084FC" },
  "mini-game": { from: "#C41D7F", to: "#FF85C2" },
  "fish-catch": { from: "#0891B2", to: "#22D3EE" },
  "table-games": { from: "#B91C1C", to: "#F87171" },
  arcade: { from: "#C2410C", to: "#FB923C" },
  other: { from: "#6B21A8", to: "#A78BFA" },
};

export type CatalogGame = {
  name: string;
  gameUid: string;
  providerCode: string;
  providerName: string;
  category: GameCategory;
  thumbnail: string;
  original: string;
};

export async function getCatalogCounts(): Promise<Record<GameCategory, number>> {
  const res = await fetch(`${API_URL}/games/catalog/counts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load category counts (${res.status})`);
  return res.json();
}

export async function getCatalogPage(
  category: GameCategory,
  page: number,
  pageSize: number
): Promise<{ games: CatalogGame[]; total: number }> {
  const params = new URLSearchParams({ category, page: String(page), pageSize: String(pageSize) });
  const res = await fetch(`${API_URL}/games/catalog?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
  return res.json();
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
