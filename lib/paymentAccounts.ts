const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "upay" | "surecash" | "crypto" | "bank";

export type PaymentAccount = {
  id: string;
  method: PaymentMethod;
  label: string;
  accountNumber: string;
  accountName: string | null;
  details: string | null;
  isActive: boolean;
  createdAt: string;
  // True only from getMyPaymentAccounts, for a player referred by an agent —
  // this account belongs to that specific agent. The deposit page must
  // always show this one instead of shuffling it in with the shared pool.
  isMyAgent: boolean;
};

// Public route — only ever returns accounts an admin has marked active, so
// this is safe to call directly from the browser with no auth. Excludes
// commission-type agents' numbers entirely (no identity to check them
// against) — see getMyPaymentAccounts for the logged-in equivalent.
export async function getActivePaymentAccounts(): Promise<PaymentAccount[]> {
  const res = await fetch(`${API_URL}/payment-accounts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load payment accounts (${res.status})`);
  return res.json();
}

// Authenticated route — same shared pool, plus (only if this player was
// referred by a commission-type agent) that agent's own numbers, which
// never appear for anyone else. Used on the logged-in Deposit/Withdraw page.
export async function getMyPaymentAccounts(): Promise<PaymentAccount[]> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  const res = await fetch(`${API_URL}/payment-accounts/mine`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load payment accounts (${res.status})`);
  return res.json();
}
