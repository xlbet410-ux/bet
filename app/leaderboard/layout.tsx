import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See 2XLbet's top players and biggest wins on the live leaderboard.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
