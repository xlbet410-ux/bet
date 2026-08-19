import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Program",
  description:
    "Level up through 2XLbet's VIP program and unlock bigger bonuses, referral commissions, and exclusive rewards as you play.",
  alternates: { canonical: "/vip" },
};

export default function VipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
