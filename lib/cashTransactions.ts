import type { PaymentMethod } from "./paymentAccounts";

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

type CreateCashTransactionInput = {
  method: PaymentMethod;
  amount: number;
  reference: string;
  // The exact agent account shown on the deposit step — lets the backend
  // record precisely which account the player was told to pay, instead of
  // re-guessing it later. Cash-out has no account for the player to see,
  // so it's never passed there.
  paymentAccountId?: string;
  // The bonus offer the player picked on the deposit step, if any — cash-in
  // only, same reasoning as paymentAccountId.
  offerId?: string;
  // True only when the player explicitly picked "do not participate in
  // any promotions" — distinct from just omitting offerId — so the
  // backend never auto-applies some other eligible offer instead.
  noOffer?: boolean;
};

async function createCashTransaction(kind: "cash-in" | "cash-out", input: CreateCashTransactionInput) {
  const res = await fetch(`${API_URL}/transactions/${kind}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export function createCashIn(input: CreateCashTransactionInput) {
  return createCashTransaction("cash-in", input);
}

export function createCashOut(input: CreateCashTransactionInput) {
  return createCashTransaction("cash-out", input);
}

export type MyCashTransaction = {
  id: string;
  type: "cash_in" | "cash_out";
  method: PaymentMethod;
  reference: string | null;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  agentLabel: string | null;
  agentAccountNumber: string | null;
};

export async function getMyCashTransactions(): Promise<MyCashTransaction[]> {
  const res = await fetch(`${API_URL}/transactions/mine`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
