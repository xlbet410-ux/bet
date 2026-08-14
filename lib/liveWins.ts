export type LiveWin = { name: string; game: string; amount: string; value: number };

// Simulated "who just won" feed — intentionally not backed by real bet data
// (no per-request DB round trip, nothing to leak about real players' win
// history). A pool of common Bangladeshi first names + real game titles,
// combined with a weighted random amount so most rows are modest and a
// small minority read as a big/jackpot win — same "mostly small, rarely
// big" shape as the Red Envelope reward table. Names are index-matched
// between the two scripts (NAMES_EN[i] and NAMES_BN[i] are the same
// person) so the same pool works under either language toggle.
const NAMES_EN = [
  "Karim", "Rahim", "Nasrin", "Jamal", "Rafiq", "Shirin", "Rima", "Salma",
  "Habib", "Anwar", "Farida", "Mizan", "Shakil", "Nusrat", "Imran", "Ayesha",
  "Sohel", "Ruma", "Kamal", "Lutfor", "Rubel", "Momtaz", "Shahana", "Farhan",
  "Mukta", "Sultana",
] as const;

const NAMES_BN = [
  "করিম", "রহিম", "নাসরিন", "জামাল", "রফিক", "শিরিন", "রিমা", "সালমা",
  "হাবিব", "আনোয়ার", "ফরিদা", "মিজান", "শাকিল", "নুসরাত", "ইমরান", "আয়েশা",
  "সোহেল", "রুমা", "কামাল", "লুৎফর", "রুবেল", "মমতাজ", "শাহানা", "ফারহান",
  "মুক্তা", "সুলতানা",
] as const;

const GAMES = [
  "Aviator", "Sweet Bonanza", "Lightning Roulette", "Crazy Time",
  "Mega Jackpot", "Blackjack VIP", "Gates of Olympus", "Fortune Tiger",
  "Wild Bandito", "Book of Dead", "Baccarat Pro", "Teen Patti",
] as const;

// [min, max, weight] — weights don't need to sum to 100, just relative.
const AMOUNT_TIERS: readonly [min: number, max: number, weight: number][] = [
  [150, 900, 55],
  [1000, 3500, 30],
  [5000, 15000, 12],
  [20000, 50000, 3],
];
const TOTAL_WEIGHT = AMOUNT_TIERS.reduce((sum, [, , w]) => sum + w, 0);

function randomAmount(): number {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const [min, max, weight] of AMOUNT_TIERS) {
    if (roll < weight) return Math.round((min + Math.random() * (max - min)) / 10) * 10;
    roll -= weight;
  }
  return AMOUNT_TIERS[0][0];
}

// Fisher-Yates — sampling without replacement so one batch never repeats a
// name, unlike a plain `sort(() => Math.random() - 0.5)` shuffle.
function shuffled<T>(pool: readonly T[]): T[] {
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateLiveWins(count: number, lang: "en" | "bn" = "en"): LiveWin[] {
  const names = lang === "bn" ? NAMES_BN : NAMES_EN;
  const indices = shuffled(names.map((_, i) => i)).slice(0, Math.min(count, names.length));
  return indices.map((i) => {
    const value = randomAmount();
    return {
      name: names[i],
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      amount: `৳${value.toLocaleString()}`,
      value,
    };
  });
}
