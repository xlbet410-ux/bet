"use client";

import { FaTrophy } from "react-icons/fa6";
import { useLang } from "@/lib/language";

export default function LiveWinsTicker() {
  const { t } = useLang();

  return (
    <section className="relative z-10 mt-10 border-y border-[#D4AF37]/15 bg-[#120920]/60 py-3">
      <div className="flex items-center gap-3 px-5">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#9B30FF]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F5C842]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" /> {t.liveWinsLabel}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
            {[...t.wins, ...t.wins].map((w, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-sm text-[#C9B8E8]">
                <FaTrophy className="text-[#F5C842]" /> {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
