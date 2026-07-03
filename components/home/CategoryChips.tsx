"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function CategoryChips() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 pt-12">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3">
        {t.categories.map((label, i) => {
          const Icon = CATEGORIES[i]?.icon;
          return (
            <button
              key={label}
              onClick={() => setActiveIdx(i)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeIdx === i
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
                  : "border border-[#7B2FBE]/40 bg-white/[0.03] text-[#C9B8E8] hover:border-[#D4AF37]/50 hover:text-[#F5C842]"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
