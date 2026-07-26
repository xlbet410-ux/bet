"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { getSliderImages, sliderImageUrl, type SliderImage } from "@/lib/sliderImages";

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useLang();

  useEffect(() => {
    getSliderImages()
      .then(setSlides)
      .finally(() => setLoading(false));
  }, []);

  const slideCount = slides.length;

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (slideCount === 0) return;
    timer.current = setInterval(() => setActive((p) => (p + 1) % slideCount), 5000);
  }, [slideCount]);

  useEffect(() => {
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [restart]);

  const handleNav = (i: number) => {
    if (slideCount === 0) return;
    setActive((i + slideCount) % slideCount);
    restart();
  };

  return (
    <section className="relative z-10 w-full px-3 pt-16 sm:px-4 sm:pt-20 md:px-6">
      <div
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-[#1B0838] shadow-[0_0_60px_#7B2FBE30] sm:rounded-3xl"
        style={{ aspectRatio: "16/7" }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 10 : 0 }}
            aria-hidden={i !== active}
          >
            <Image
              src={sliderImageUrl(s)}
              alt={s.originalName}
              fill
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1152px) 100vw, 1152px"
              className="object-cover object-center"
              unoptimized
            />
          </div>
        ))}

        {!loading && slideCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#7B5EA7]">
            No slider images yet.
          </div>
        )}

        {slideCount > 1 && (
          <>
            <button
              onClick={() => handleNav(active - 1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60 sm:left-4 sm:h-10 sm:w-10 sm:text-base"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => handleNav(active + 1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition-all hover:bg-[#7B2FBE]/60 sm:right-4 sm:h-10 sm:w-10 sm:text-base"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-4">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => handleNav(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                    i === active
                      ? "w-6 bg-gradient-to-r from-[#D4AF37] to-[#F5C842] sm:w-8"
                      : "w-1.5 bg-white/40 hover:bg-white/70 sm:w-2"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* stat row */}
      <div className="mx-auto mt-4 grid max-w-3xl grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
        {([
          ["3,000+", t.statGames],
          ["500K+",  t.statPlayers],
          ["24/7",   t.statSupport],
        ] as [string, string][]).map(([num, label]) => (
          <div
            key={label}
            className="rounded-xl border border-white/5 bg-white/[0.03] py-3 text-center backdrop-blur-sm sm:rounded-2xl sm:py-5"
          >
            <p className="bg-gradient-to-r from-[#F5C842] to-[#D4AF37] bg-clip-text text-lg font-extrabold text-transparent sm:text-2xl md:text-3xl">
              {num}
            </p>
            <p className="mt-0.5 text-[10px] text-[#9B8EC4] sm:mt-1 sm:text-xs md:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
