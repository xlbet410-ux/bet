"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaXmark, FaCrown, FaGift } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { getPopupOffers, type PopupOffer } from "@/lib/offers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function PromoPopup({ trigger }: { trigger: boolean }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState<PopupOffer[]>([]);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const strings =
    lang === "bn"
      ? { announcement: "ঘোষণা" }
      : { announcement: "Announcement" };

  // No dismiss-tracking on purpose — this refetches and reopens on every
  // homepage mount (i.e. every time the player lands on "/"), not just once
  // per session. Retries with backoff like every other homepage fetch
  // (HeroSlider, LiveGames): the homepage fires several requests at once on
  // a cold load and can trip the global rate limiter on the first attempt.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const maxAttempts = 4;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getPopupOffers();
          if (!cancelled) setOffers(list);
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) setOffers([]);
    }

    load().finally(() => {
      if (!cancelled) setOffersLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!trigger || !offersLoaded || offers.length === 0) return;
    const tm = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(tm);
  }, [trigger, offersLoaded, offers.length]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  const offerCount = offers.length;

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (offerCount < 2) return;
    timer.current = setInterval(() => setActive((p) => (p + 1) % offerCount), 6000);
  }, [offerCount]);

  useEffect(() => {
    if (!open) return;
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [open, restart]);

  const handleNav = (i: number) => {
    if (offerCount === 0) return;
    setActive((i + offerCount) % offerCount);
    restart();
  };

  if (!open || offerCount === 0) return null;

  const offer = offers[active];
  const title = (lang === "bn" ? offer.titleBn : offer.titleEn) || offer.titleBn;
  const description = (lang === "bn" ? offer.descriptionBn : offer.descriptionEn) || offer.descriptionBn;
  const ctaText = lang === "bn" ? offer.popupCtaTextBn : offer.popupCtaTextEn;
  const bannerSrc = offer.bannerUrl || offer.imageUrl;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md max-h-[90vh] flex-col animate-[popIn_0.35s_ease] overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#1B0838] shadow-[0_0_70px_#7B2FBE55]"
      >
        {/* header bar */}
        <div
          className="relative flex shrink-0 items-center justify-center gap-2 py-4"
          style={{ background: "linear-gradient(135deg,#7B2FBE,#4A0E8F)" }}
        >
          <FaCrown className="text-lg text-[#F5C842]" />
          <h2 className="text-base font-extrabold text-white">{strings.announcement}</h2>
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-base text-white backdrop-blur-sm transition-all hover:bg-black/70"
        >
          <FaXmark />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="relative w-full shrink-0 overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            {bannerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${API_URL}${bannerSrc}`} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]">
                <FaGift className="text-4xl text-[#D4AF37]/50" />
              </div>
            )}

            {offerCount > 1 && (
              <>
                <button
                  onClick={() => handleNav(active - 1)}
                  aria-label="Previous"
                  className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => handleNav(active + 1)}
                  aria-label="Next"
                  className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>

          <div className="p-5 text-center">
            <h3 className="mb-1.5 text-lg font-extrabold text-white">{title}</h3>
            {description && <p className="mb-4 text-sm leading-relaxed text-[#C9B8E8]">{description}</p>}

            {ctaText && offer.popupCtaLink && (
              <Link
                href={offer.popupCtaLink}
                onClick={close}
                className="inline-block rounded-full px-6 py-3 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>

        {offerCount > 1 && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 p-3">
            <button
              onClick={() => handleNav(active - 1)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#0A0612] transition-all"
              style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
            >
              <FaChevronLeft className="text-[10px]" /> {lang === "bn" ? "পূর্ববর্তী" : "Previous"}
            </button>
            <div className="flex gap-1.5">
              {offers.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => handleNav(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-gradient-to-r from-[#D4AF37] to-[#F5C842]" : "w-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => handleNav(active + 1)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#0A0612] transition-all"
              style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
            >
              {lang === "bn" ? "পরবর্তী" : "Next"} <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
