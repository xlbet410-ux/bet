const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

export type GameCategory =
  | "featured"
  | "slots"
  | "live_casino"
  | "cards"
  | "fishing"
  | "mini_games"
  | "sports";

export const CATEGORY_ORDER: GameCategory[] = [
  "featured",
  "slots",
  "live_casino",
  "cards",
  "fishing",
  "mini_games",
  "sports",
];

// Labels are localized (see lib/language.tsx `categoryLabels`) since the
// site has a real EN/BN toggle — these icons are language-agnostic.
export const CATEGORY_ICONS: Record<GameCategory, string> = {
  featured: "🔥",
  slots: "🎰",
  live_casino: "💃",
  cards: "🃏",
  fishing: "🐟",
  mini_games: "🚀",
  sports: "🏏",
};

export const CATEGORY_ACCENT: Record<GameCategory, { from: string; to: string }> = {
  featured: { from: "#DC2626", to: "#F97316" },
  slots: { from: "#D4AF37", to: "#F5C842" },
  live_casino: { from: "#0F9D58", to: "#34D399" },
  cards: { from: "#B91C1C", to: "#F87171" },
  fishing: { from: "#0891B2", to: "#22D3EE" },
  mini_games: { from: "#C41D7F", to: "#FF85C2" },
  sports: { from: "#1D4ED8", to: "#60A5FA" },
};

// Real, verifiable sub-tags only — a game only gets one when its own name
// contains the word. There's no Oracle data for reel count, Megaways/Bonus
// Buy mechanics, or feature flags, so this list stays intentionally small.
export type SubTag = "megaways" | "jackpot";
export const SUB_TAGS: SubTag[] = ["megaways", "jackpot"];

export type CatalogGame = {
  name: string;
  gameUid: string;
  providerCode: string;
  providerName: string;
  category: GameCategory;
  featured: boolean;
  subTags: SubTag[];
  thumbnail: string;
  original: string;
};

export async function getCatalogCounts(): Promise<Record<GameCategory, number>> {
  const res = await fetch(`${API_URL}/games/catalog/counts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load category counts (${res.status})`);
  return res.json();
}

export async function getSubTagCounts(category: GameCategory): Promise<Record<SubTag, number>> {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_URL}/games/catalog/subtags?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sub-tag counts (${res.status})`);
  return res.json();
}

export async function getCatalogPage(
  category: GameCategory,
  page: number,
  pageSize: number,
  tag?: SubTag
): Promise<{ games: CatalogGame[]; total: number }> {
  const params = new URLSearchParams({ category, page: String(page), pageSize: String(pageSize) });
  if (tag) params.set("tag", tag);
  const res = await fetch(`${API_URL}/games/catalog?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
  return res.json();
}

export async function searchCatalog(q: string): Promise<{ games: CatalogGame[]; total: number }> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`${API_URL}/games/catalog/search?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
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
