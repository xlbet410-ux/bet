export type VipTier = {
  level: number;
  groupName: string;
  nameBn: string;
  nameEn: string;
  requiredDeposit: string;
  requiredBet: string;
  bonusAmount: string;
  turnoverMultiplier: string;
  bonusValidityDays: number | null;
  referralSignupBonus: string;
  referralBetCommissionPct: string;
  dailyCashbackPct: string;
};

export type VipStatus = {
  level: number;
  lifetimeDepositAmount: string;
  lifetimeBetAmount: string;
  vipUpgradedAt: string | null;
  current: VipTier;
  next: VipTier | null;
  depositProgressPercent: number;
  betProgressPercent: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

async function parseApiError(res: Response) {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {}
  return "Something went wrong. Please try again.";
}

export async function getVipTiers(): Promise<VipTier[]> {
  const res = await fetch(`${API_URL}/vip/tiers`, { cache: "no-store" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function getMyVipStatus(): Promise<VipStatus> {
  const res = await fetch(`${API_URL}/vip/status`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
