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
          // punches a real circular notch out of the bar's top edge, centered
          // behind the deposit circle — a mask cutout, not a hand-drawn path,
          // so it stays a clean circle at every screen width instead of
          // stretching/distorting.
          WebkitMaskImage:
            "radial-gradient(circle 34px at 50% 0%, transparent 32px, black 35px)",
          maskImage:
            "radial-gradient(circle 34px at 50% 0%, transparent 32px, black 35px)",
        }}
      >
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

        {/* deposit — raised center circle, sitting inside the notch */}
        <Link
          href="/profile?tab=deposit"
          onClick={requireAuth}
          className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            pathname === "/profile" ? "text-[#F5C842]" : "text-white"
          }`}
        >
          <span
            className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full text-xl text-[#0A0612]"
            style={{
              background: "linear-gradient(135deg, #F5C842, #D4AF37)",
              boxShadow: "0 4px 18px rgba(212,175,55,0.55)",
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
