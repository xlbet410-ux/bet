export type WithdrawableInfo = {
  allowed: boolean;
  reason?: string;
  maxWithdrawable: string;
  pendingBonuses: Array<{
    id: string;
    type: string;
    amount: string;
    turnoverRequired: string;
    turnoverDone: string;
    progressPercent: number;
    daysLeft: number;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

export async function getWithdrawable(): Promise<WithdrawableInfo> {
  const res = await fetch(`${API_URL}/offers/withdrawable`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load wallet status.");
  return res.json();
}
