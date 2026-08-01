"use client";

import { useLang } from "@/lib/language";
import { PROVIDERS } from "@/lib/data";

export default function ProviderStrip() {
  const { t, lang } = useLang();

  return (
    <section className="relative z-10 mx-auto mt-1 max-w-6xl px-5">
      {/* label */}
      <p className="mb-3 text-center text-[9px] font-black uppercase tracking-[0.35em] text-[#6A5E8A]">
        {lang === "bn" ? "বিশ্বের শীর্ষ প্রদানকারী দ্বারা চালিত" : "Powered by the world's leading providers"}
      </p>

      {/* track */}
      <div
        className="relative overflow-hidden rounded-2xl py-4"
        style={{
          background: "linear-gradient(to right, rgba(123,47,190,0.08), rgba(212,175,55,0.04), rgba(123,47,190,0.08))",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0A0612]/80 to-transparent" />
        {/* right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0A0612]/80 to-transparent" />

        <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-0 whitespace-nowrap">
          {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
            <span key={i} className="flex items-center">
              <span className="px-8 text-sm font-bold tracking-wide text-[#C9B8E8]/55 transition-colors hover:text-[#F5C842]">
                {p}
              </span>
              <span className="text-[#D4AF37]/20 text-xs">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
