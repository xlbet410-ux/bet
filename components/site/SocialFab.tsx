"use client";

import { useEffect, useRef, useState } from "react";
import { FaTelegram, FaWhatsapp, FaXmark, FaUsers } from "react-icons/fa6";

// Social group links. Swap these two for the real group/channel URLs —
// they're the only thing in this file that needs changing.
const TELEGRAM_URL = "https://t.me/2xlbet";
const WHATSAPP_URL = "https://wa.me/8801000000000";

type Social = {
  label: string;
  href: string;
  icon: React.ReactNode;
  // Brand colours rather than the site palette — a Telegram/WhatsApp button
  // is recognised by its colour before its icon is read.
  background: string;
  glow: string;
};

const SOCIALS: Social[] = [
  {
    label: "Telegram",
    href: TELEGRAM_URL,
    icon: <FaTelegram />,
    background: "linear-gradient(135deg,#2AABEE,#229ED9)",
    glow: "#2AABEE",
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    icon: <FaWhatsapp />,
    background: "linear-gradient(135deg,#4AD504,#25D366)",
    glow: "#25D366",
  },
];

/**
 * Floating social-group launcher, stacked above BackToTop (and above
 * ChatSupport on desktop) in the same bottom-right column — see the
 * bottom-* values below, which are picked to clear both at every
 * breakpoint. Collapsed it's a single pulsing badge; tapping it fans the
 * group links out upward.
 */
export default function SocialFab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tapping anywhere else, or pressing Escape, closes the fan — otherwise
  // it stays open over whatever the player scrolls to next.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    // right-6 with w-12 circles puts every button's centre 48px from the
    // right edge, the same axis BackToTop and ChatSupport already sit on.
    <div ref={rootRef} className="fixed bottom-40 right-6 z-[85] flex flex-col items-end gap-3">
      {SOCIALS.map((s, i) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-2.5 transition-all duration-300 ease-out ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-75 opacity-0"
          }`}
          // Staggered so the two fan out in sequence rather than together,
          // and reversed on close so the last one out is the first back in.
          style={{ transitionDelay: `${(open ? i : SOCIALS.length - 1 - i) * 60}ms` }}
        >
          <span className="whitespace-nowrap rounded-full border border-[#D4AF37]/30 bg-[#1B0838]/95 px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_#00000070] backdrop-blur-sm">
            {s.label}
          </span>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-white transition-transform hover:scale-110"
            style={{ background: s.background, boxShadow: `0 0 20px ${s.glow}70` }}
          >
            {s.icon}
          </span>
        </a>
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close social links" : "Open social links"}
        aria-expanded={open}
        className="relative flex h-12 w-12 items-center justify-center rounded-full text-xl text-[#0A0612] shadow-[0_4px_20px_#00000060] transition-transform duration-300 hover:scale-110"
        style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
      >
        {/* Attention pulse, dropped once the fan is open so it doesn't
            keep flashing while the player is reading the links. */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-[pulseGlow_1.8s_ease-in-out_infinite] rounded-full"
            style={{ boxShadow: "0 0 22px #F5C842" }}
          />
        )}
        <span className={`relative transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}>
          {open ? <FaXmark /> : <FaUsers />}
        </span>
      </button>
    </div>
  );
}
