"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function CategoryChips() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 pt-4 sm:pt-8">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 sm:gap-3">
        {t.categories.map((label, i) => {
          const Icon = CATEGORIES[i]?.icon;
          return (
            <button
              key={label}
              onClick={() => setActiveIdx(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-5 sm:py-2 sm:text-sm ${
                activeIdx === i
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
                  : "border border-[#7B2FBE]/40 bg-white/[0.03] text-[#C9B8E8] hover:border-[#D4AF37]/50 hover:text-[#F5C842]"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
