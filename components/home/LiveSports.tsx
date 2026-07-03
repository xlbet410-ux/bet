"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import MatchCard from "./MatchCard";
import { SPORTS, LIVE_MATCHES } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function LiveSports() {
  const [sportIdx, setSportIdx] = useState(0);
  const { t } = useLang();

  // filter using English sport name from data (matches m.sport values)
  const matches =
    sportIdx === 0
      ? LIVE_MATCHES
      : LIVE_MATCHES.filter((m) => m.sport === SPORTS[sportIdx].label);

  return (
    <section className="relative z-10 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.liveNow}
          eyebrowColor="#4ade80"
          barFrom="#22c55e"
          barTo="#4ade80"
          title={<>{t.sportsWord} <span className="text-[#F5C842]">{t.sportsHighlight}</span></>}
          action={{ label: t.viewAll }}
        />

        <div className="mb-6 flex flex-wrap gap-3">
          {t.sportLabels.map((label, i) => {
            const Icon = SPORTS[i]?.icon;
            return (
              <button
                key={label}
                onClick={() => setSportIdx(i)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  sportIdx === i
                    ? "bg-gradient-to-r from-[#22c55e] to-[#4ade80] text-[#0A0612]"
                    : "border border-[#7B2FBE]/40 bg-white/[0.03] text-[#C9B8E8] hover:border-[#22c55e]/50 hover:text-[#4ade80]"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />} {label}
              </button>
            );
          })}
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {matches.map((m) => (
              <MatchCard key={`${m.home}-${m.away}`} match={m} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/5 bg-white/[0.02] py-12 text-center text-sm text-[#9B8EC4]">
            {t.noMatches}
          </p>
        )}
      </div>
    </section>
  );
}
