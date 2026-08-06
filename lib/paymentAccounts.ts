const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "upay" | "crypto" | "bank";

export type PaymentAccount = {
  id: string;
  method: PaymentMethod;
  label: string;
  accountNumber: string;
  accountName: string | null;
  details: string | null;
  isActive: boolean;
  createdAt: string;
};

// Public route — only ever returns accounts an admin has marked active, so
// this is safe to call directly from the browser with no auth.
export async function getActivePaymentAccounts(): Promise<PaymentAccount[]> {
  const res = await fetch(`${API_URL}/payment-accounts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load payment accounts (${res.status})`);
  return res.json();
}
