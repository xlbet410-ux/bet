"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHouse, FaGift, FaSackDollar, FaHeadset, FaCrown } from "react-icons/fa6";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { NAV_HREFS } from "@/lib/data";

// Fixed bottom tab bar for mobile/tablet — mirrors the desktop header's nav
// entries (Home, Promotions, Member/profile) plus two mobile-only shortcuts
// (Deposit, Services) that on desktop live inside the header/profile page.
// Deposit gets a raised, centered circle per the reference design.
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] lg:hidden">
      <div
        className="relative flex items-center justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
        style={{
          background: "#0D0620",
          borderTop: "1px solid rgba(212,175,55,0.15)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* real cutout in the bar's top edge, centered behind the deposit
            circle — a genuinely transparent SVG hole (not a mask/backing
            disc), so whatever is behind the fixed bar shows through, same
            as the reference design */}
        <svg
          viewBox="0 0 120 60"
          className="pointer-events-none absolute left-1/2 top-0 h-15 w-33 -translate-x-1/2 -translate-y-1/2"
        >
          <path
            d="M0,60 V0 H18 V24 A33,33 0 0 0 60,48 A33,33 0 0 0 102,24 V0 H120 V60 Z"
            fill="#0D0620"
          />
        </svg>
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
            pathname === "/" ? "text-[#F5C842]" : "text-white hover:text-[#F5C842]"
          }`}
        >
          <FaHouse className="text-lg" />
          {t.bottomNavHome}
        </Link>

        <Link
          href={NAV_HREFS[4] ?? "#"}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-white transition-colors hover:text-[#F5C842]"
        >
          <FaGift className="text-lg" />
          {t.bottomNavPromotion}
        </Link>

        {/* deposit — raised center circle, sitting inside the cutout */}
        <Link
          href="/profile?tab=deposit"
          onClick={requireAuth}
          className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            pathname === "/profile" ? "text-[#F5C842]" : "text-white"
          }`}
        >
          <span
            className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full text-xl text-[#0A0612] ring-2 ring-[#0D0620]"
            style={{
              background: "linear-gradient(135deg, #F5C842, #D4AF37)",
              boxShadow: "0 6px 22px rgba(212,175,55,0.65), 0 2px 6px rgba(0,0,0,0.5)",
            }}
          >
            <FaSackDollar />
          </span>
          {t.deposit}
        </Link>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-chat-support"))}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-white transition-colors hover:text-[#F5C842]"
        >
          <FaHeadset className="text-lg" />
          {t.bottomNavServices}
        </button>

        <Link
          href="/profile"
          onClick={requireAuth}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${
            pathname === "/profile" ? "text-[#F5C842]" : "text-white hover:text-[#F5C842]"
          }`}
        >
          <FaCrown className="text-lg" />
          {t.bottomNavMember}
        </Link>
      </div>
    </nav>
  );
}
