export type ReferralStats = {
  referralCode: string;
  referralEnabled: boolean;
  counts: { total: number; pending: number; milestoneMet: number; fraudFlagged: number };
  currentTierPerks: {
    vipLevel: number;
    referralSignupBonus: string;
    referralBetCommissionPct: string;
  };
  lifetimeCommissionEarned: string;
  referrals: Array<{
    id: string;
    referredName: string;
    referredMemberId: string;
    status: "pending" | "milestone_met" | "fraud_flagged";
    joinedAt: string;
    milestoneMetAt: string | null;
  }>;
  recentCommissions: Array<{
    id: string;
    amount: string;
    betAmount: string;
    createdAt: string;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

export async function getReferralStats(): Promise<ReferralStats> {
  const res = await fetch(`${API_URL}/referral/stats`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load referral stats.");
  return res.json();
}
