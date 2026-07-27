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

export type GameCategory = "slots" | "live-casino" | "sports" | "esports" | "other";

export const CATEGORY_ORDER: GameCategory[] = ["slots", "live-casino", "sports", "esports", "other"];

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  slots: "Slots",
  "live-casino": "Live Casino",
  sports: "Sports",
  esports: "Esports",
  other: "More Providers",
};

// Oracle's provider list has no category field, so providers are grouped by
// well-known brand name first, then by keywords in their own name (e.g.
// "Sports", "Live", "Slots"). Anything not confidently matched by either
// falls into "other" rather than being guessed.
const KNOWN_NAME_CATEGORY: Record<string, GameCategory> = {
  "pgsoft": "slots",
  "play'n go": "slots",
  "playson": "slots",
  "habanero": "slots",
  "netent asia": "slots",
  "red tiger asia": "slots",
  "btg asia": "slots",
  "nlc asia": "slots",
  "spribe": "slots",
  "evoplay asia": "slots",
  "evoplay eu": "slots",
  "fastspin": "slots",
  "smartsoft": "slots",
  "epicwin": "slots",
  "gameart": "slots",
  "skywind": "slots",
  "relax": "slots",
  "bng": "slots",
  "betsoft": "slots",
  "endorphina": "slots",
  "rubyplay": "slots",
  "jilisweep": "slots",
  "playtech asia": "slots",
  "playtech eu": "slots",
  "turbo asia": "slots",
  "turbo eu": "slots",
  "funky games": "slots",
  "onlyplay": "slots",
  "aviatrix": "slots",
  "fachai": "slots",
  "rich88": "slots",
  "galaxsys": "slots",
  "hacksaw asia": "slots",
  "hacksaw latam": "slots",
  "hacksaw world": "slots",
  "mg": "slots",
  "vivo": "live-casino",
  "biggaming": "live-casino",
  "ezugi": "live-casino",
  "sa": "live-casino",
  "creedroomz": "live-casino",
  "betby": "sports",
  "sbo": "sports",
  "cmd": "sports",
  "dpessports": "esports",
};

export function categorizeProvider(name: string): GameCategory {
  const key = name.trim().toLowerCase();
  if (KNOWN_NAME_CATEGORY[key]) return KNOWN_NAME_CATEGORY[key];

  if (/e-?sport/.test(key)) return "esports";
  if (/sport/.test(key)) return "sports";
  if (/(casino|live)/.test(key)) return "live-casino";
  if (/slot/.test(key)) return "slots";
  return "other";
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
