const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type WithdrawalSettings = {
  kycEnabled: boolean;
  withdrawPasswordEnabled: boolean;
};

// Public, no auth — CRM-controlled switches for which verification
// method(s) the withdraw page should show/require.
export async function getWithdrawalSettings(): Promise<WithdrawalSettings> {
  const res = await fetch(`${API_URL}/withdrawal-settings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Something went wrong. Please try again.");
  return res.json();
}
