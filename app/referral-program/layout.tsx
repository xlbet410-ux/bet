import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Program",
  description:
    "Invite friends to 2XLbet and earn referral bonuses, milestone rewards, and ongoing commission on their deposits — all in one place.",
  alternates: { canonical: "/referral-program" },
};

export default function ReferralProgramLayout({ children }: { children: React.ReactNode }) {
  return children;
}
