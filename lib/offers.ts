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

export type PublicOffer = {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  descriptionBn: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  termsBn: string | null;
  category: string;
  triggerType: string;
  rewardType: "fixed" | "percentage" | "no_reward";
  rewardAmount: string | null;
  rewardCap: string | null;
  turnoverMultiplier: string;
  bonusValidityDays: number | null;
  alreadyClaimed: boolean;
  eligible: boolean;
};

// Every active offer for a category (referral/level/daily/...), regardless
// of whether this player is currently eligible — used for promo pages that
// should show what's available, not silently hide entries.
export async function getOffers(category?: string): Promise<PublicOffer[]> {
  const url = new URL(`${API_URL}/offers`);
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
  return res.json();
}

export type PopupOffer = {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  descriptionBn: string | null;
  descriptionEn: string | null;
  bannerUrl: string | null;
  imageUrl: string | null;
  rewardType: "fixed" | "percentage" | "no_reward";
  rewardAmount: string | null;
  rewardCap: string | null;
  popupCtaTextBn: string | null;
  popupCtaTextEn: string | null;
  popupCtaLink: string | null;
};

// Shared between the Promotions page and the homepage popup — both render
// the same "+X%" / "+৳X" reward badge from the same offer shape.
export function rewardLabel(
  o: { rewardType: "fixed" | "percentage" | "no_reward"; rewardAmount: string | null; rewardCap: string | null },
  lang: string
): string {
  if (o.rewardType === "no_reward" || !o.rewardAmount) return "";
  if (o.rewardType === "fixed") return `৳${Number(o.rewardAmount).toLocaleString()}`;
  const cap = o.rewardCap
    ? ` (${lang === "bn" ? "সর্বোচ্চ" : "up to"} ৳${Number(o.rewardCap).toLocaleString()})`
    : "";
  return `${o.rewardAmount}%${cap}`;
}

// Public — no auth required, since the popup shows to guests too.
export async function getPopupOffers(): Promise<PopupOffer[]> {
  const res = await fetch(`${API_URL}/offers/popup`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load popup offers (${res.status})`);
  return res.json();
}

export type DepositOffer = {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  descriptionBn: string | null;
  imageUrl: string | null;
  rewardType: "fixed" | "percentage" | "no_reward";
  rewardAmount: string | null;
  rewardCap: string | null;
  potentialReward: string;
  turnoverMultiplier: string;
  turnoverBase: string;
  bonusValidityDays: number | null;
  termsBn: string | null;
};

// Offers this player could actually pick for the given deposit amount —
// already filtered by eligibility (KYC/VIP/min-max/budget/claim limit).
export async function getApplicableDepositOffers(amount: number): Promise<DepositOffer[]> {
  const res = await fetch(`${API_URL}/offers/applicable-for-deposit?amount=${amount}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export type MyBonus = {
  id: string;
  type: string;
  amount: string;
  turnoverRequired: string;
  turnoverDone: string;
  status: "active" | "completed" | "forfeited" | "expired";
  expiresAt: string | null;
  claimedAt: string;
  completedAt: string | null;
};

export type MyBonusesResponse = {
  active: MyBonus | null;
  queued: MyBonus[];
  completed: MyBonus[];
  forfeited: MyBonus[];
  expired: MyBonus[];
};

export async function getMyBonuses(): Promise<MyBonusesResponse> {
  const res = await fetch(`${API_URL}/offers/my-bonuses`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

// Gives up the bonus (and its remaining turnover requirement) permanently
// — the bonus amount itself is lost, never returned to the player.
export async function forfeitBonus(bonusId: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/bonuses/${bonusId}/forfeit`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function claimOffer(slug: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${slug}/claim`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}
