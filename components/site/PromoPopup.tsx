"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaXmark, FaCrown, FaGift, FaWandMagicSparkles } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { getPopupOffers, localizedImage, rewardLabel, type PopupOffer } from "@/lib/offers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function PromoPopup({ trigger }: { trigger: boolean }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState<PopupOffer[]>([]);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const strings =
    lang === "bn"
      ? { badge: "স্পেশাল অফার", terms: "শর্তাবলী" }
      : { badge: "Special Offer", terms: "Terms & Conditions" };

  // Switching slides (nav or auto-advance) collapses any open terms panel
  // instead of carrying it over to a different offer's terms.
  useEffect(() => {
    setTermsOpen(false);
  }, [active]);

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
  // Prefer the popup-specific banner in the current language, falling back
  // to the other language's banner if only one was uploaded, and finally to
  // the card image if no popup banner was ever set for this offer at all
  // (existing behavior, unchanged).
  const bannerSrc =
    localizedImage(offer.bannerUrl, offer.bannerUrlEn, lang) || localizedImage(offer.imageUrl, offer.imageUrlEn, lang);
  const reward = rewardLabel(offer, lang);
  const terms = (lang === "bn" ? offer.termsBn : offer.termsEn) || offer.termsBn;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease]" />

      {/* ambient glow behind the card, matching the site's hero/auth-modal treatment.
          Opacity-only pulse (not scale) — this popup reopens on nearly every
          homepage visit, so keeping the 100px-blur layer's size static avoids
          repeated filter repaint cost while still reading as "alive". */}
      <div
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[#9B30FF]/25 blur-[100px] animate-[pulseGlowSoft_4s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute h-[280px] w-[280px] translate-x-24 translate-y-16 rounded-full bg-[#D4AF37]/20 blur-[90px]"
        aria-hidden="true"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full max-h-[90vh] flex-col animate-[popIn_0.35s_ease] overflow-hidden rounded-[28px] bg-[#150A2E] shadow-[0_0_0_1px_rgba(212,175,55,.35),0_20px_80px_rgba(0,0,0,.6),0_0_60px_rgba(155,48,255,.25)] ${
          offer.imageOnly ? "max-w-sm" : "max-w-md"
        }`}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-black/60 text-sm text-[#F5C842] backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/80"
        >
          <FaXmark />
        </button>

        {offer.imageOnly ? (
          <div className="relative flex-1 overflow-y-auto">
            {bannerSrc ? (
              // Deliberately raw <img>, not next/image: image-only mode's
              // whole point is showing the upload at its own natural aspect
              // ratio with no cropping, which next/image can't do without a
              // pre-known width/height or a fixed-aspect `fill` container.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${API_URL}${bannerSrc}`} alt={title} className="block w-full" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]">
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
        ) : (
        <div className="flex-1 overflow-y-auto">

          <div className="relative w-full shrink-0 overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            {bannerSrc ? (
              <Image
                src={`${API_URL}${bannerSrc}`}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]">
                <FaGift className="text-4xl text-[#D4AF37]/50" />
              </div>
            )}

            {/* floating badge over the banner, replacing the old flat header bar */}
            <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#0A0612] shadow-[0_4px_16px_rgba(212,175,55,.5)]"
                style={{ background: "linear-gradient(135deg,#F5C842,#D4AF37)" }}
              >
                <FaCrown className="text-[11px]" /> {strings.badge}
              </span>
              {reward && (
                <span
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-[0_4px_16px_rgba(123,47,190,.5)]"
                  style={{ background: "linear-gradient(135deg,#9B30FF,#4A0E8F)" }}
                >
                  <FaWandMagicSparkles className="text-[10px]" /> +{reward}
                </span>
              )}
            </div>

            {/* scrim blending the image straight into the content below it */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#150A2E] to-transparent" />

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

          <div className="px-5 pb-5 pt-1 text-center">
            <h3 className="mb-1.5 bg-gradient-to-r from-[#F5C842] to-[#D4AF37] bg-clip-text text-xl font-black text-transparent">
              {title}
            </h3>
            {description && <p className="mb-5 text-sm leading-relaxed text-[#C9B8E8]">{description}</p>}

            {ctaText && offer.popupCtaLink && (
              <Link href={offer.popupCtaLink} onClick={close} className="group relative inline-block">
                <span
                  className="absolute inset-0 rounded-full blur-md transition-opacity animate-[pulseGlow_2.4s_ease-in-out_infinite] group-hover:opacity-100"
                  style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
                  aria-hidden="true"
                />
                <span
                  className="relative flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-black text-[#0A0612] transition-transform group-hover:scale-[1.03]"
                  style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
                >
                  {ctaText}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_0.9s_ease]"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )}

            {terms && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTermsOpen((v) => !v)}
                  className="mx-auto flex items-center gap-1 text-[11px] font-semibold text-[#9B8EC4] transition-colors hover:text-[#F5C842]"
                >
                  {strings.terms}
                  <FaChevronDown className={`text-[9px] transition-transform ${termsOpen ? "rotate-180" : ""}`} />
                </button>
                {termsOpen && (
                  <p className="mt-2 text-left text-[11px] leading-relaxed text-[#8A7DB0]">{terms}</p>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {offerCount > 1 && (
          <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-black/20 p-3">
            {offers.map((o, i) => (
              <button
                key={o.id}
                onClick={() => handleNav(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-7 bg-gradient-to-r from-[#D4AF37] to-[#F5C842]" : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
