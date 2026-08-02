"use client";

import { FaGift } from "react-icons/fa6";
import { useLang } from "@/lib/language";

export default function CtaStrip({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
}) {
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 py-3 sm:py-4">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#1B0838] to-[#0A0612] p-6 text-center sm:p-10">
        <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">{t.ctaTitle}</h2>
        <p className="mt-3 text-sm text-[#9B8EC4] sm:text-base">{t.ctaDesc}</p>
        <button
          onClick={() => onOpenAuth("register")}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] px-6 py-3 text-center text-sm font-bold text-[#0A0612] shadow-[0_0_30px_#D4AF3770] transition-all hover:scale-105 sm:mt-7 sm:px-10 sm:py-4 sm:text-lg"
        >
          {t.ctaButton} <FaGift />
        </button>
      </div>
    </section>
  );
}
