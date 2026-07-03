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
    <section className="relative z-10 px-5 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#1B0838] to-[#0A0612] p-10 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{t.ctaTitle}</h2>
        <p className="mt-3 text-[#9B8EC4]">{t.ctaDesc}</p>
        <button
          onClick={() => onOpenAuth("register")}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] px-10 py-4 text-lg font-bold text-[#0A0612] shadow-[0_0_30px_#D4AF3770] transition-all hover:scale-105"
        >
          {t.ctaButton} <FaGift />
        </button>
      </div>
    </section>
  );
}
