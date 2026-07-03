"use client";

import { useCountUp } from "@/lib/hooks";
import { useLang } from "@/lib/language";

export default function JackpotBanner({ run }: { run: boolean }) {
  const jackpot = useCountUp(8472690, 2200, run);
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 py-14">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1B0838] via-[#2D0A5E] to-[#1B0838] p-8 text-center shadow-[0_0_60px_#7B2FBE30] md:p-12">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        <p className="relative text-xs font-medium uppercase tracking-[0.3em] text-[#E8CF7A]">
          {t.jackpotEyebrow}
        </p>
        <p
          className="relative mt-3 text-4xl font-extrabold tabular-nums tracking-tight md:text-6xl"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          <span className="bg-gradient-to-r from-[#C8923B] via-[#F5C842] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_0_20px_#D4AF3760]">
            ${jackpot.toLocaleString("en-US")}
          </span>
        </p>
        <p className="relative mt-3 text-sm text-[#9B8EC4]">{t.jackpotDesc}</p>
        <button className="relative mt-7 rounded-full bg-gradient-to-r from-[#9B30FF] to-[#4A0E8F] px-8 py-3.5 font-bold shadow-[0_0_25px_#9B30FF60] transition-all hover:scale-105">
          {t.jackpotPlay}
        </button>
      </div>
    </section>
  );
}
