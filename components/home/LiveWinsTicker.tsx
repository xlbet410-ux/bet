"use client";

import { FaCrown, FaTrophy, FaMedal } from "react-icons/fa6";
import { useLang } from "@/lib/language";

function tierOf(value: number) {
  if (value >= 5000)
    return {
      icon: FaCrown,
      ring: "from-[#F5C842] to-[#D4AF37]",
      text: "text-[#F5C842]",
      border: "hover:border-[#F5C842]/50",
      glow: "shadow-[0_0_16px_#F5C84230]",
    };
  if (value >= 1000)
    return {
      icon: FaTrophy,
      ring: "from-[#9B30FF] to-[#4A0E8F]",
      text: "text-[#C9B8E8]",
      border: "hover:border-[#9B30FF]/50",
      glow: "shadow-[0_0_14px_#9B30FF25]",
    };
  return {
    icon: FaMedal,
    ring: "from-[#22d3ee] to-[#3b82f6]",
    text: "text-[#7DCFEF]",
    border: "hover:border-[#22d3ee]/50",
    glow: "",
  };
}

export default function LiveWinsTicker() {
  const { t } = useLang();

  return (
    <section className="relative z-10 mt-8 overflow-hidden border-y border-[#D4AF37]/15 bg-gradient-to-r from-[#120920] via-[#1B0838]/60 to-[#120920] py-4 sm:mt-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#9B30FF12,transparent_70%)]" />

      <div className="relative flex items-center gap-4 px-5">
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="flex items-center gap-2 rounded-full bg-[#9B30FF]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F5C842] shadow-[0_0_12px_#9B30FF30]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            {t.liveWinsLabel}
          </span>
          <span className="hidden pl-1 text-[11px] text-[#9B8EC4] sm:block">{t.liveWinsSub}</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#120920] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#120920] to-transparent" />

          <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-3 whitespace-nowrap hover:[animation-play-state:paused]">
            {[...t.wins, ...t.wins].map((w, i) => {
              const tier = tierOf(w.value);
              const Icon = tier.icon;
              return (
                <div
                  key={i}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 backdrop-blur-sm transition-colors ${tier.border} ${tier.glow}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tier.ring} text-xs font-extrabold text-[#1B0838]`}
                  >
                    {w.name.charAt(0)}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {w.name}
                      <Icon className={`text-[11px] ${tier.text}`} />
                    </span>
                    <span className="text-[11px] text-[#9B8EC4]">{w.game}</span>
                  </div>
                  <span className={`ml-1 text-sm font-extrabold tabular-nums ${tier.text}`}>+{w.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
