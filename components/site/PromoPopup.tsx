"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6";
import { getPromoImages, promoImageUrl, type PromoImage } from "@/lib/promoImages";

export default function PromoPopup({ trigger }: { trigger: boolean }) {
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<PromoImage[]>([]);
  const [slidesLoaded, setSlidesLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getPromoImages()
      .then(setSlides)
      .finally(() => setSlidesLoaded(true));
  }, []);

  useEffect(() => {
    if (!trigger || !slidesLoaded || slides.length === 0) return;
    const tm = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(tm);
  }, [trigger, slidesLoaded, slides.length]);

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

  const slideCount = slides.length;

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (slideCount < 2) return;
    timer.current = setInterval(() => setActive((p) => (p + 1) % slideCount), 4000);
  }, [slideCount]);

  useEffect(() => {
    if (!open) return;
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [open, restart]);

  const handleNav = (i: number) => {
    if (slideCount === 0) return;
    setActive((i + slideCount) % slideCount);
    restart();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg max-h-[90vh] flex-col animate-[popIn_0.35s_ease] overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#1B0838] shadow-[0_0_70px_#7B2FBE55]"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-base text-white backdrop-blur-sm transition-all hover:bg-black/70"
        >
          <FaXmark />
        </button>

        <div className="relative w-full shrink-0 overflow-hidden bg-black" style={{ height: "min(48vh, 380px)" }}>
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 10 : 0 }}
              aria-hidden={i !== active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={promoImageUrl(s)}
                alt={s.originalName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}

          {slideCount > 1 && (
            <>
              <button
                onClick={() => handleNav(active - 1)}
                aria-label="Previous slide"
                className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handleNav(active + 1)}
                aria-label="Next slide"
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60"
              >
                <FaChevronRight />
              </button>

              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleNav(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? "w-6 bg-gradient-to-r from-[#D4AF37] to-[#F5C842]" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
