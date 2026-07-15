"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCrown, FaMedal } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useLang } from "@/lib/language";
import { LEADERBOARD, type LeaderboardEntry } from "@/lib/data";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};

const TIERS = [
  {
    ring: "from-[#F5C842] to-[#D4AF37]",
    text: "text-[#F5C842]",
    glow: "shadow-[0_0_32px_#F5C84240]",
    cardBg: "linear-gradient(165deg, rgba(245,200,66,.16) 0%, rgba(27,8,56,.75) 55%)",
    pedestalBorder: "rgba(245,200,66,.4)",
  },
  {
    ring: "from-[#E8ECF4] to-[#94A3B8]",
    text: "text-[#CBD5E1]",
    glow: "shadow-[0_0_22px_#94A3B835]",
    cardBg: "linear-gradient(165deg, rgba(148,163,184,.14) 0%, rgba(27,8,56,.75) 55%)",
    pedestalBorder: "rgba(148,163,184,.32)",
  },
  {
    ring: "from-[#E0A468] to-[#A85C2A]",
    text: "text-[#E0A468]",
    glow: "shadow-[0_0_22px_#A85C2A35]",
    cardBg: "linear-gradient(165deg, rgba(168,92,42,.16) 0%, rgba(27,8,56,.75) 55%)",
    pedestalBorder: "rgba(168,92,42,.32)",
  },
];

function PodiumCard({
  entry,
  place,
  label,
  gamesLabel,
  wageredLabel,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  label: string;
  gamesLabel: string;
  wageredLabel: string;
}) {
  const tier = TIERS[place - 1];
  const Icon = place === 1 ? FaCrown : FaMedal;
  const isFirst = place === 1;
  const order = place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3";

  return (
    <div className={`relative flex-1 ${order} ${isFirst ? "z-10 sm:-translate-y-4" : ""}`}>
      {/* rank badge */}
      <div
        className={`absolute -top-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-[#1B0838] ${tier.ring} ${tier.glow}`}
        style={{ boxShadow: `0 0 0 4px #0A0612, 0 0 0 5px ${tier.pedestalBorder}` }}
      >
        {place}
      </div>

      <div
        className={`flex flex-col items-center rounded-2xl px-4 pb-5 pt-8 text-center transition-transform duration-300 hover:-translate-y-1 ${tier.glow}`}
        style={{ background: tier.cardBg, border: `1px solid ${tier.pedestalBorder}` }}
      >
        <Icon className={`mb-2 text-xl ${tier.text}`} />
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-black text-[#1B0838] ${tier.ring} ${
            isFirst ? "h-20 w-20 text-2xl" : "h-16 w-16 text-lg"
          } ${tier.glow}`}
        >
          {entry.name.charAt(0)}
        </div>
        <p className="mt-3 max-w-[120px] truncate text-sm font-bold text-white">{entry.name}</p>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${tier.text}`}>{label}</p>
        <p className={`mt-2 text-xl font-black tabular-nums ${tier.text}`}>${entry.winnings.toLocaleString()}</p>
        <p className="mt-1 text-[11px] text-[#9B8EC4]">
          {entry.games} {gamesLabel} · ${entry.wagered.toLocaleString()} {wageredLabel}
        </p>
      </div>
    </div>
  );
}

function LeaderRow({ entry, gamesLabel, wageredLabel }: { entry: LeaderboardEntry; gamesLabel: string; wageredLabel: string }) {
  const isTop3 = entry.rank <= 3;
  const tier = isTop3 ? TIERS[entry.rank - 1] : null;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04] sm:px-4 sm:py-3"
      style={
        isTop3
          ? { background: tier!.cardBg, border: `1px solid ${tier!.pedestalBorder}` }
          : { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }
      }
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
          isTop3 ? tier!.text : "text-[#9B8EC4]"
        }`}
        style={!isTop3 ? { background: "rgba(255,255,255,.05)" } : undefined}
      >
        {entry.rank}
      </span>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-black text-[#1B0838] ${
          isTop3 ? tier!.ring : "from-[#9B30FF] to-[#4A0E8F]"
        }`}
      >
        {entry.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
        <p className="text-[11px] text-[#9B8EC4]">
          {entry.games} {gamesLabel} · ${entry.wagered.toLocaleString()} {wageredLabel}
        </p>
      </div>
      <p className={`font-extrabold tabular-nums ${isTop3 ? tier!.text : "text-[#F5C842]"}`}>
        ${entry.winnings.toLocaleString()}
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  const { t } = useLang();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [top1, top2, top3, ...rest] = LEADERBOARD;

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-4xl">
          {/* breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-[#9B8EC4]">
            <Link href="/" className="transition-colors hover:text-[#F5C842]">
              Home
            </Link>
            <span className="text-[#4A3870]">›</span>
            <span className="text-[#C9B8E8]">{t.lbBreadcrumb}</span>
          </div>

          {/* title */}
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E8CF7A]">{t.lbEyebrow}</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              {t.lbTitleWord}{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F5C842] to-[#D4AF37] bg-clip-text text-transparent">
                {t.lbTitleHighlight}
              </span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#9B8EC4]">{t.lbDesc}</p>
          </div>

          {/* podium */}
          <div className="mb-12 flex items-start justify-center gap-3 sm:gap-5">
            <PodiumCard entry={top2} place={2} label={t.lbPlace2} gamesLabel={t.lbGames} wageredLabel={t.lbWagered} />
            <PodiumCard entry={top1} place={1} label={t.lbPlace1} gamesLabel={t.lbGames} wageredLabel={t.lbWagered} />
            <PodiumCard entry={top3} place={3} label={t.lbPlace3} gamesLabel={t.lbGames} wageredLabel={t.lbWagered} />
          </div>

          {/* full list */}
          <div className="rounded-2xl p-3 sm:p-5" style={CARD}>
            <div className="space-y-1.5">
              {[top1, top2, top3, ...rest].map((entry) => (
                <LeaderRow key={entry.rank} entry={entry} gamesLabel={t.lbGames} wageredLabel={t.lbWagered} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
