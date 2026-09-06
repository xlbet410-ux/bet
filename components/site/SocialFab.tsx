"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FaTelegram, FaWhatsapp, FaFacebookF, FaXmark, FaComments, FaChevronDown } from "react-icons/fa6";

// Hidden for the rest of the visit once dismissed, not forever —
// sessionStorage, so it comes back on the player's next visit rather than
// disappearing permanently after one stray tap.
const DISMISS_KEY = "2xlbet:socialFabDismissed";

// Read through useSyncExternalStore rather than an effect: the server has
// no sessionStorage, and this is the one API that lets the server and the
// client disagree about a value without desyncing hydration. `storage`
// only fires in *other* tabs, so dismissing in this one is tracked by
// local state instead (see the component).
function subscribeToDismissal(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private mode / blocked storage: just show the widget.
    return false;
  }
}

// Server never has it dismissed, so the badge is always in the initial HTML.
const readDismissedOnServer = () => false;

type Social = {
  label: string;
  href: string;
  icon: React.ReactNode;
  // Brand colours rather than the site palette: these buttons are
  // recognised by their colour before the icon is even read.
  background: string;
  glow: string;
};

const SOCIALS: Social[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1DhiewDpkv/",
    icon: <FaFacebookF />,
    background: "linear-gradient(135deg,#1877F2,#0C63D4)",
    glow: "#1877F2",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/qr/PBCMCN2QVQZAL1",
    icon: <FaWhatsapp />,
    background: "linear-gradient(135deg,#4AD504,#25D366)",
    glow: "#25D366",
  },
  // Closest to the button, so the most-used group is the easiest to reach.
  {
    label: "Telegram",
    href: "https://t.me/+4d96wFMumV1jZmI0",
    icon: <FaTelegram />,
    background: "linear-gradient(135deg,#2AABEE,#229ED9)",
    glow: "#2AABEE",
  },
];

/**
 * Floating social-group launcher, stacked above BackToTop (and above
 * ChatSupport on desktop) in the same bottom-right column. Collapsed it's
 * a badge ringed by a slowly rotating gold/purple gradient; tapping it
 * fans the group links out upward. The small cross dismisses the whole
 * thing for the rest of the visit.
 */
export default function SocialFab() {
  const [open, setOpen] = useState(false);
  // Dismissing in this tab fires no storage event, so it's held locally and
  // OR'd with what a previous page view in this visit already stored.
  const [dismissedHere, setDismissedHere] = useState(false);
  const dismissedEarlier = useSyncExternalStore(
    subscribeToDismissal,
    readDismissed,
    readDismissedOnServer,
  );
  const dismissed = dismissedHere || dismissedEarlier;
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

  function dismiss() {
    setOpen(false);
    setDismissedHere(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Not persisting is fine — it stays hidden for this page view.
    }
  }

  if (dismissed) return null;

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
          // Staggered so they fan out in sequence rather than together, and
          // reversed on close so the last one out is the first back in.
          style={{ transitionDelay: `${(open ? SOCIALS.length - 1 - i : i) * 60}ms` }}
        >
          <span className="whitespace-nowrap rounded-full border border-[#D4AF37]/30 bg-[#1B0838]/95 px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_#00000070] backdrop-blur-sm">
            {s.label}
          </span>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg text-white transition-transform hover:scale-110"
            style={{ background: s.background, boxShadow: `0 0 20px ${s.glow}70` }}
          >
            {s.icon}
          </span>
        </a>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse social links" : "Open our social groups"}
          aria-expanded={open}
          className="relative flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
        >
          {/* Rotating gradient ring, revealed as a ring by the inner face
              sitting on top of it. Paused while open so the fan reads as
              the calmer, primary thing on screen. */}
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full ${open ? "" : "animate-spin"}`}
            style={{
              background: "conic-gradient(from 0deg,#D4AF37,#F5C842,#9B30FF,#7B2FBE,#D4AF37)",
              animationDuration: "5s",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-[2.5px] rounded-full bg-gradient-to-br from-[#231046] to-[#0A0612]"
          />
          {/* Outer halo, dropped once open so it isn't flashing while the
              player is reading the links. */}
          {!open && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-[pulseGlow_2s_ease-in-out_infinite] rounded-full"
              style={{ boxShadow: "0 0 24px #D4AF37" }}
            />
          )}
          <span
            className={`relative text-xl text-[#F5C842] transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          >
            {open ? <FaChevronDown /> : <FaComments />}
          </span>
        </button>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide social links"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-[#0A0612] text-[9px] text-white/70 shadow-[0_2px_8px_#00000080] transition-colors hover:bg-[#7B2FBE] hover:text-white"
        >
          <FaXmark />
        </button>
      </div>
    </div>
  );
}
