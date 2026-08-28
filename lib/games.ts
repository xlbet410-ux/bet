const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

export type GameCategory =
  | "featured"
  | "hot_games"
  | "slots"
  | "live_casino"
  | "cards"
  | "fishing"
  | "mini_games"
  | "sports"
  | "esports";

// "sports" sits right under "hot_games" (operator request, for the 9Wicket
// launch) — every other section keeps its prior relative order.
export const CATEGORY_ORDER: GameCategory[] = [
  "featured",
  "hot_games",
  "sports",
  "slots",
  "live_casino",
  "cards",
  "fishing",
  "mini_games",
  "esports",
];

// Labels are localized (see lib/language.tsx `categoryLabels`) since the
// site has a real EN/BN toggle — these icons are language-agnostic.
export const CATEGORY_ICONS: Record<GameCategory, string> = {
  featured: "⭐",
  hot_games: "🔥",
  slots: "🎰",
  live_casino: "💃",
  cards: "🃏",
  fishing: "🐟",
  mini_games: "🚀",
  sports: "🏏",
  esports: "🎮",
};

export const CATEGORY_ACCENT: Record<GameCategory, { from: string; to: string }> = {
  featured: { from: "#DC2626", to: "#F97316" },
  hot_games: { from: "#EA580C", to: "#FBBF24" },
  slots: { from: "#D4AF37", to: "#F5C842" },
  live_casino: { from: "#0F9D58", to: "#34D399" },
  cards: { from: "#B91C1C", to: "#F87171" },
  fishing: { from: "#0891B2", to: "#22D3EE" },
  mini_games: { from: "#C41D7F", to: "#FF85C2" },
  sports: { from: "#1D4ED8", to: "#60A5FA" },
  esports: { from: "#7C3AED", to: "#A78BFA" },
};

// Sportsbook aggregators expose one entry-point "game" per provider rather
// than real per-title artwork, and Oracle's own thumbnail for these is
// consistently broken — these operator-supplied poster images replace it.
// SBO ships two different games under the same provider code, so that one
// needs the game name too. Every other provider (still shown in Live
// Sports/Esports, or anywhere else) falls back to a generic branded card —
// see GameCard's onError handler for when Oracle's own image 404s at runtime.
const SPORTS_CARD_IMAGES: Record<string, string> = {
  SABA: "/SPORTS_SABA_IBC.png",
  UG: "/SPORTS_UG.png",
  BTI: "/SPORTS_BTI.png",
  BETBY: "/SPORTS_BETBY.png",
  "9W": "/SPORTS_9Wicket.png",
};
export const GENERIC_CARD_IMAGE = "/gamecard.png";

export function resolveSportsCardImage(
  providerCode: string | undefined,
  gameName: string
): string | null {
  if (!providerCode) return null;
  const code = providerCode.trim().toUpperCase();
  if (code === "SBO") {
    return /virtual/i.test(gameName) ? "/SPORTS_SBO_VP.png" : "/SPORTS_SBO_SPORTSBOOK.png";
  }
  return SPORTS_CARD_IMAGES[code] ?? null;
}

// Real, verifiable sub-tags only. "megaways"/"jackpot" come from a literal
// name match; the rest come from Oracle's own per-game raw category, so they
// only ever appear within the category that raw value already maps to (e.g.
// table_games/video_poker only within Cards, crash_games/arcade/bingo/
// scratches only within Mini Games). There's no data for reel count, Bonus
// Buy, Free Spins, Respins, Cascade Slots, or Cricket-as-a-slot-feature.
export type SubTag =
  | "megaways"
  | "jackpot"
  | "table_games"
  | "video_poker"
  | "crash_games"
  | "arcade"
  | "bingo"
  | "scratches";
export const SUB_TAGS: SubTag[] = [
  "megaways",
  "jackpot",
  "table_games",
  "video_poker",
  "crash_games",
  "arcade",
  "bingo",
  "scratches",
];

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

export type ProviderSort = "name_asc" | "name_desc" | "featured";

export async function getCatalogPage(
  category: GameCategory,
  page: number,
  pageSize: number,
  tag?: SubTag,
  providerCode?: string,
  sort?: ProviderSort
): Promise<{ games: CatalogGame[]; total: number }> {
  const params = new URLSearchParams({ category, page: String(page), pageSize: String(pageSize) });
  if (tag) params.set("tag", tag);
  if (providerCode) params.set("providerCode", providerCode);
  if (sort) params.set("sort", sort);
  // Public route — but sending the token when we have one (logged-in
  // player) lets the backend personalize the Featured category to that
  // player's own recently-played games. Guests get the plain platform-wide
  // list, same as before.
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await fetch(`${API_URL}/games/catalog?${params}`, { cache: "no-store", headers });
  if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
  return res.json();
}

export type CategoryProvider = { code: string; name: string; count: number };

export async function getCategoryProviders(category: GameCategory): Promise<CategoryProvider[]> {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_URL}/games/catalog/category-providers?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load providers (${res.status})`);
  return res.json();
}

export async function getAllProviders(): Promise<CategoryProvider[]> {
  const res = await fetch(`${API_URL}/games/catalog/all-providers`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load providers (${res.status})`);
  return res.json();
}

export async function getProviderCatalog(
  code: string,
  page = 1,
  pageSize = 300,
  sort?: ProviderSort
): Promise<{ games: CatalogGame[]; total: number; providerName: string }> {
  const params = new URLSearchParams({ code, page: String(page), pageSize: String(pageSize) });
  if (sort) params.set("sort", sort);
  const res = await fetch(`${API_URL}/games/catalog/provider?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load provider games (${res.status})`);
  return res.json();
}

export async function searchCatalog(
  q: string,
  signal?: AbortSignal
): Promise<{ games: CatalogGame[]; total: number }> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`${API_URL}/games/catalog/search?${params}`, { cache: "no-store", signal });
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

// Must match backend GamesService's NINE_WICKET_GAME_UID exactly.
export const NINE_WICKET_GAME_UID = "9wicket-lobby";

// Every game normally opens via the /play/[gameUid] page, which embeds the
// launched game_url in an iframe. 9Wicket's own hosting refuses to run
// inside an iframe (unlike every other provider) — it has to launch
// straight into its own new browser tab instead. Centralized here so every
// "Play" entry point (home, category pages, provider pages) gets the same
// behavior without each duplicating the special case.
export async function openGame(
  gameUid: string,
  router: { push: (href: string) => void }
): Promise<void> {
  if (gameUid !== NINE_WICKET_GAME_UID) {
    router.push(`/play/${gameUid}`);
    return;
  }

  // window.open must run synchronously inside the click handler, or
  // browsers block it as a popup — open a blank tab immediately, then point
  // it at the real game_url once the launch call resolves, instead of
  // awaiting first and calling window.open from an async callback.
  const tab = window.open("", "_blank");
  if (!tab) {
    alert("Please allow pop-ups for this site to launch 9Wicket.");
    return;
  }
  try {
    const { gameUrl } = await launchGame(gameUid);
    tab.location.href = gameUrl;
  } catch (err) {
    tab.close();
    alert(err instanceof Error ? err.message : "Couldn't launch this game right now.");
  }
}
