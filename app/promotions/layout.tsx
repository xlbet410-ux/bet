import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions & Bonuses",
  description:
    "Explore 2XLbet's live promotions — deposit bonuses, welcome offers, VIP rewards, referral bonuses and cashback for players in Bangladesh.",
  alternates: { canonical: "/promotions" },
};

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
