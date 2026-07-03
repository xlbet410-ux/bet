"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FaArrowRightLong, FaXmark } from "react-icons/fa6";
import { useLang } from "@/lib/language";

const STORAGE_KEY = "2xlbet:promo-seen";

export default function PromoPopup({
  trigger,
  onOpenAuth,
}: {
  trigger: boolean;
  onOpenAuth: (mode: "login" | "register") => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    if (!trigger || sessionStorage.getItem(STORAGE_KEY)) return;
    const tm = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(tm);
  }, [trigger]);

  const close = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg animate-[popIn_0.35s_ease] overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#1B0838] shadow-[0_0_70px_#7B2FBE55]"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-base text-white backdrop-blur-sm transition-all hover:bg-black/70"
        >
          <FaXmark />
        </button>

        <div className="relative aspect-[9/4] w-full">
          <Image src="/hero1.png" alt="Welcome bonus promotion" fill sizes="512px" className="object-cover" priority />
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pb-7 pt-5 text-center">
          <p className="text-sm text-[#C9B8E8]">{t.promoDesc}</p>

          <button
            onClick={() => { close(); onOpenAuth("register"); }}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] py-3.5 text-base font-bold text-[#0A0612] shadow-[0_0_25px_#D4AF3760] transition-all hover:scale-[1.02]"
          >
            {t.promoButton} <FaArrowRightLong />
          </button>
          <button onClick={close} className="text-xs text-[#7A6E9C] transition-colors hover:text-[#C9B8E8]">
            {t.promoLater}
          </button>
        </div>
      </div>
    </div>
  );
}
