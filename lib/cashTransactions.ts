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
