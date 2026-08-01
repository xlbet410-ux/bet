"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { NAV_HREFS } from "@/lib/data";

// Fixed bottom tab bar for mobile/tablet, matching an exact reference design:
// a full-width SVG background with a curved notch cut into the top-center,
// and a raised gold circle (Deposit) floating in that notch. Pixel values
// below intentionally mirror the reference 1:1 rather than being re-derived.
export default function MobileBottomNav({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLang();

  function requireAuth(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      onOpenAuth("login");
    }
  }

  const isHome = pathname === "/";
  const isProfile = pathname === "/profile";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] h-[78px] lg:hidden">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 420 78"
        preserveAspectRatio="none"
        style={{ filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.4))" }}
      >
        <defs>
          <linearGradient id="mobileNavGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <path
          d="M 0 14 L 158 14 C 170 14, 172 22, 180 30 A 30 30 0 0 0 240 30 C 248 22, 250 14, 262 14 L 420 14 L 420 78 L 0 78 Z"
          fill="url(#mobileNavGrad)"
        />
      </svg>

      <div className="absolute inset-0 grid grid-cols-5 items-end pb-2.5">
        <Link
          href="/"
          className={`flex flex-col items-center justify-end gap-[5px] py-1 ${isHome ? "text-[#E8A93B]" : "text-white"}`}
        >
          <svg className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.8L2.4 11.2c-.3.3-.1.8.3.8H4v8c0 .6.4 1 1 1h4v-6h6v6h4c.6 0 1-.4 1-1v-8h1.3c.4 0 .6-.5.3-.8L12 2.8z" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.2px]">{t.bottomNavHome}</span>
        </Link>

        <Link
          href={NAV_HREFS[4] ?? "#"}
          className="flex flex-col items-center justify-end gap-[5px] py-1 text-white"
        >
          <svg
            className="h-[26px] w-[26px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="8" width="18" height="4" rx="0.5" />
            <path d="M5 12v9h14v-9" />
            <line x1="12" y1="8" x2="12" y2="21" />
            <path d="M12 8S10.5 3.5 8 3.5C6.6 3.5 6 4.5 6 5.5S6.8 8 8.5 8H12z" />
            <path d="M12 8s1.5-4.5 4-4.5c1.4 0 2 1 2 2s-.8 2.5-2.5 2.5H12z" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.2px]">{t.bottomNavPromotion}</span>
        </Link>

        {/* deposit — keeps its grid column, label sits low, circle floats up out of the notch */}
        <Link
          href="/profile?tab=deposit"
          onClick={requireAuth}
          className="relative flex flex-col items-center justify-end pt-[22px]"
        >
          <span
            className="absolute left-1/2 flex h-[62px] w-[62px] -translate-x-1/2 items-center justify-center rounded-full"
            style={{
              top: "-26px",
              background:
                "radial-gradient(circle at 32% 28%, #FFDA85 0%, #F0B040 35%, #C87A1A 75%, #8A4E10 100%)",
              boxShadow:
                "0 6px 16px rgba(200,122,26,0.5), 0 2px 4px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,240,200,0.4)",
            }}
          >
            <svg
              className="h-[34px] w-[34px] text-white"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8.6 2.2c-.4.3-.7.9-.7 1.5 0 .4.1.7.3 1H7.5c-.3 0-.6.1-.8.4L4.9 8c-.9 1.4-1.9 3.5-1.9 5.5C3 18.2 7 22 12 22s9-3.8 9-8.5c0-2-1-4.1-1.9-5.5l-1.8-2.9c-.2-.3-.5-.4-.8-.4h-.7c.2-.3.3-.6.3-1 0-.6-.3-1.2-.7-1.5-.3-.2-.7-.2-1 0L12 3.4 9.6 2.2c-.3-.2-.7-.2-1 0zM12 8.5c.5 0 .9.4.9.9v.4c1.2.2 2.1 1.1 2.1 2.3h-1.7c0-.4-.4-.8-.9-.8h-.8c-.5 0-.9.3-.9.7 0 .3.2.5.6.6l1.9.5c1.2.3 2 1.1 2 2.2 0 1.2-.9 2.1-2.2 2.3v.4c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-.4c-1.2-.2-2.1-1.1-2.1-2.3h1.7c0 .4.4.8.9.8h.8c.5 0 .9-.3.9-.7 0-.3-.2-.5-.6-.6l-1.9-.5c-1.2-.3-2-1.1-2-2.2 0-1.2.9-2.1 2.2-2.3v-.4c0-.5.4-.9.9-.9z" />
            </svg>
          </span>
          <span className="mt-[34px] text-center text-[13px] font-medium text-white">{t.deposit}</span>
        </Link>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-chat-support"))}
          className="flex flex-col items-center justify-end gap-[5px] py-1 text-white"
        >
          <svg
            className="h-[26px] w-[26px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 14.5c0 1.1-.9 2-2 2H8l-4 3.5V5c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2v9.5z" />
            <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.2px]">{t.bottomNavServices}</span>
        </button>

        <Link
          href="/profile"
          onClick={requireAuth}
          className={`flex flex-col items-center justify-end gap-[5px] py-1 ${isProfile ? "text-[#E8A93B]" : "text-white"}`}
        >
          <svg className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 8.5c0-.3.3-.5.6-.4l4 2.3c.3.2.6.1.8-.2L11.2 5c.4-.6 1.2-.6 1.6 0l2.8 5.2c.2.3.5.4.8.2l4-2.3c.3-.2.6 0 .6.4L19.5 18c-.1.3-.3.5-.6.5H5.1c-.3 0-.5-.2-.6-.5L3 8.5z" />
            <rect x="4.5" y="19.5" width="15" height="2" rx="0.4" />
            <circle cx="12" cy="4.2" r="1" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.2px]">{t.bottomNavMember}</span>
        </Link>
      </div>
    </nav>
  );
}
