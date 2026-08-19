import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Levels",
  description:
    "See every 2XLbet VIP level and what it takes to reach it — deposit and wagering requirements, level-up bonuses, and referral commission rates.",
  alternates: { canonical: "/vip-level" },
};

export default function VipLevelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
