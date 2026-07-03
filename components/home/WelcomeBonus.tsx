"use client";

import { FaArrowRightLong } from "react-icons/fa6";
import { useLang } from "@/lib/language";

export default function WelcomeBonus({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
}) {
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 overflow-hidden rounded-3xl border border-[#7B2FBE]/40 bg-gradient-to-r from-[#150628] via-[#2D0A5E] to-[#150628] p-8 shadow-[0_0_50px_#7B2FBE25] md:flex-row md:p-10">
        <div className="text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#E8CF7A]">
            {t.welcomeEyebrow}
          </p>
          <h2 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-[#F5C842] to-[#D4AF37] bg-clip-text text-transparent">
              {t.welcomeAmount}
            </span>
          </h2>
          <p className="mt-2 text-[#C9B8E8]">{t.welcomeDesc}</p>
        </div>
        <button
          onClick={() => onOpenAuth("register")}
          className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] px-8 py-4 text-lg font-bold text-[#0A0612] shadow-[0_0_25px_#D4AF3760] transition-all hover:scale-105 md:w-auto"
        >
          {t.claimBonus} <FaArrowRightLong />
        </button>
      </div>
    </section>
  );
}
