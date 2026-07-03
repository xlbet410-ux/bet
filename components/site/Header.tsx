"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { FaBars, FaXmark, FaChevronDown } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { useScrolled } from "@/lib/hooks";
import { NAV_DROPDOWNS } from "@/lib/data";

function LangPill({ compact = false }: { compact?: boolean }) {
  const { lang, toggle } = useLang();
  return (
    <div className={`flex rounded-full border border-white/10 p-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
      <button
        onClick={() => lang !== "en" && toggle()}
        className={`rounded-full px-2.5 py-1 font-semibold transition-all ${
          lang === "en"
            ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
            : "text-[#9B8EC4] hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => lang !== "bn" && toggle()}
        className={`rounded-full px-2.5 py-1 font-semibold transition-all ${
          lang === "bn"
            ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
            : "text-[#9B8EC4] hover:text-white"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}

export default function Header({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "register") => void;
}) {
  const scrolled = useScrolled(20);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLang();

  function handleMouseEnter(idx: number) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (NAV_DROPDOWNS[idx]) setOpenMenu(idx);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  }

  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function toggleMobileExpand(idx: number) {
    setMobileExpanded((prev) => (prev === idx ? null : idx));
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background,border-color,box-shadow,backdrop-filter] duration-300 animate-[slideDown_0.65s_cubic-bezier(0.25,0.46,0.45,0.94)_2.2s_both] ${
          scrolled
            ? "border-[#D4AF37]/20 bg-[#0A0612]/95 shadow-[0_4px_20px_#00000060] backdrop-blur-xl"
            : "border-[#D4AF37]/10 bg-[#0A0612]/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-5">
          <Link href="/" aria-label="Go to home">
            <Image
              src="/logo.png"
              alt="2XLbet Casino"
              width={96}
              height={96}
              priority
              className="h-10 w-auto drop-shadow-[0_0_12px_#9B30FF55] sm:h-12 transition-opacity hover:opacity-80"
            />
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium tracking-wide text-[#C9B8E8] lg:flex xl:gap-8">
            {t.nav.map((n, idx) => {
              const hasDropdown = !!NAV_DROPDOWNS[idx];
              const isOpen = openMenu === idx;
              return (
                <div
                  key={n}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href="#"
                    className={`flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#F5C842] ${
                      isOpen ? "text-[#F5C842]" : ""
                    }`}
                  >
                    {n}
                    {hasDropdown && (
                      <FaChevronDown
                        className={`h-2.5 w-2.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </a>

                  {/* dropdown panel */}
                  {hasDropdown && isOpen && (
                    <div
                      className="absolute left-1/2 top-full z-50 mt-3 w-[360px] -translate-x-1/2 animate-[popIn_0.18s_ease] rounded-2xl p-3"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(27,8,56,0.97) 0%, rgba(10,6,18,0.99) 100%)",
                        border: "1px solid rgba(212,175,55,0.2)",
                        boxShadow:
                          "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                      onMouseEnter={keepOpen}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* caret */}
                      <div
                        className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-tl-sm"
                        style={{
                          background: "rgba(27,8,56,0.97)",
                          border: "1px solid rgba(212,175,55,0.2)",
                          borderBottom: "none",
                          borderRight: "none",
                        }}
                      />

                      {/* 2×2 grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {NAV_DROPDOWNS[idx].map((item) => (
                          <a
                            key={item.key}
                            href="#"
                            className="group/dd relative overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                              border: "1px solid rgba(255,255,255,0.07)",
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
                            {/* image */}
                            <div className="relative h-24 w-full overflow-hidden rounded-t-xl">
                              <Image
                                src={item.img}
                                alt={t.dropdownLabels[item.key] ?? item.key}
                                fill
                                className="object-cover transition-transform duration-300 group-hover/dd:scale-110"
                                sizes="120px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/70 via-transparent to-transparent" />
                              {/* gold shimmer on hover */}
                              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/dd:opacity-100"
                                style={{
                                  background: "linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.15) 50%, transparent 60%)",
                                }}
                              />
                            </div>

                            {/* label */}
                            <p className="truncate px-2 py-1.5 text-[11px] font-semibold text-[#B8AAD4] transition-colors group-hover/dd:text-[#F5C842]">
                              {t.dropdownLabels[item.key] ?? item.key}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* right controls */}
          <div className="flex items-center gap-2">
            <LangPill />
            <button
              onClick={() => onOpenAuth("login")}
              className="hidden rounded-full border border-[#D4AF37]/60 px-4 py-2 text-sm font-medium text-[#E8CF7A] transition-all hover:bg-[#D4AF37]/10 sm:inline-flex"
            >
              {t.login}
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="hidden rounded-full bg-gradient-to-r from-[#9B30FF] via-[#7B2FBE] to-[#4A0E8F] px-5 py-2 text-sm font-semibold shadow-[0_0_18px_#7B2FBE70] transition-all hover:shadow-[0_0_28px_#9B30FFAA] sm:inline-flex"
            >
              {t.register}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-base text-[#E8CF7A] lg:hidden"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col overflow-y-auto border-l border-[#D4AF37]/20 bg-gradient-to-b from-[#1B0838] to-[#0A0612] p-6 shadow-[0_0_40px_#00000080] animate-[slideIn_0.25s_ease]">
            <div className="mb-5 flex items-center justify-between">
              <Link href="/" onClick={() => setMobileOpen(false)} aria-label="Go to home">
                <Image src="/logo.png" alt="2XLbet Casino" width={80} height={80} className="h-9 w-auto" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-base text-[#C9B8E8] hover:bg-white/10"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mb-4">
              <LangPill />
            </div>

            <nav className="flex flex-col gap-1 text-base font-medium text-[#C9B8E8]">
              {t.nav.map((n, idx) => {
                const hasDropdown = !!NAV_DROPDOWNS[idx];
                const isExpanded = mobileExpanded === idx;
                return (
                  <div key={n}>
                    <div className="flex items-center rounded-xl hover:bg-white/5">
                      <a
                        href="#"
                        onClick={() => { if (!hasDropdown) setMobileOpen(false); }}
                        className="flex-1 px-3 py-3 transition-colors hover:text-[#F5C842]"
                      >
                        {n}
                      </a>
                      {hasDropdown && (
                        <button
                          onClick={() => toggleMobileExpand(idx)}
                          className="flex h-11 w-11 items-center justify-center text-[#9B8EC4] transition-colors hover:text-[#F5C842]"
                          aria-label="Expand submenu"
                        >
                          <FaChevronDown
                            className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* mobile accordion submenu — 2-col image grid */}
                    {hasDropdown && isExpanded && (
                      <div className="mb-2 mt-1 grid grid-cols-2 gap-2 px-2 animate-[fadeIn_0.15s_ease]">
                        {NAV_DROPDOWNS[idx].map((item) => (
                          <a
                            key={item.key}
                            href="#"
                            onClick={() => setMobileOpen(false)}
                            className="group/mob relative overflow-hidden rounded-xl"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <div className="relative h-16 w-full overflow-hidden rounded-t-xl">
                              <Image
                                src={item.img}
                                alt={t.dropdownLabels[item.key] ?? item.key}
                                fill
                                className="object-cover transition-transform duration-300 group-hover/mob:scale-110"
                                sizes="120px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/75 via-transparent to-transparent" />
                            </div>
                            <p className="truncate px-1.5 py-1.5 text-[10px] font-semibold text-[#B8AAD4] transition-colors group-hover/mob:text-[#F5C842]">
                              {t.dropdownLabels[item.key] ?? item.key}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <button
                onClick={() => { setMobileOpen(false); onOpenAuth("login"); }}
                className="w-full rounded-full border border-[#D4AF37]/60 px-4 py-3 text-sm font-medium text-[#E8CF7A] transition-all hover:bg-[#D4AF37]/10"
              >
                {t.login}
              </button>
              <button
                onClick={() => { setMobileOpen(false); onOpenAuth("register"); }}
                className="w-full rounded-full bg-gradient-to-r from-[#9B30FF] via-[#7B2FBE] to-[#4A0E8F] px-5 py-3 text-sm font-semibold shadow-[0_0_18px_#7B2FBE70]"
              >
                {t.register}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
