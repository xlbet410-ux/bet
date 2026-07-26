"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaBars, FaXmark, FaChevronDown } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { useScrolled } from "@/lib/hooks";
import { NAV_DROPDOWNS, NAV_HREFS } from "@/lib/data";
import logo from "@/assets/logo.png";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const { user, logout } = useAuth();

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

  // close profile dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
              src={logo}
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
                  <Link
                    href={NAV_HREFS[idx] ?? "#"}
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
                  </Link>

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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LangPill />

            {user ? (
              /* ── logged-in profile widget ── */
              <div className="flex items-center gap-2" ref={profileRef}>
                {/* balance pill */}
                <div
                  className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 sm:flex"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-[#D4AF37] stroke-2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 3H8a2 2 0 0 0-2 4h12a2 2 0 0 0-2-4z" />
                    <circle cx="16" cy="14" r="1.5" className="fill-[#D4AF37] stroke-none" />
                  </svg>
                  <span className="text-xs font-black text-[#F5C842]">{user.balance}</span>
                </div>

                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/5 py-1.5 pl-1.5 pr-3 transition-all hover:border-[#D4AF37]/70 hover:bg-white/10"
                >
                  {/* avatar */}
                  <div className="relative">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-[#0A0612]"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #F5C842)" }}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    {/* verified badge on avatar */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                      style={{ background: "#22c55e", border: "1.5px solid #0A0612" }}
                    >
                      <svg viewBox="0 0 10 10" className="h-2 w-2 fill-none stroke-white stroke-[2]">
                        <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="hidden max-w-[96px] truncate text-sm font-semibold text-[#E8CF7A] sm:block">
                    {user.name}
                  </span>
                  <FaChevronDown
                    className={`h-2.5 w-2.5 text-[#9B8EC4] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* profile dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-3 w-56 animate-[popIn_0.18s_ease] overflow-hidden rounded-2xl"
                    style={{
                      background: "linear-gradient(145deg, rgba(27,8,56,0.98) 0%, rgba(10,6,18,0.99) 100%)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* user info */}
                    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                      <div className="relative shrink-0">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-[#0A0612]"
                          style={{ background: "linear-gradient(135deg, #D4AF37, #F5C842)" }}
                        >
                          {user.name[0].toUpperCase()}
                        </div>
                        <div
                          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                          style={{ background: "#22c55e", border: "2px solid #0A0612" }}
                        >
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-none stroke-white stroke-2">
                            <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-bold text-white">{user.name}</p>
                          <span
                            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                            style={{ background: "#22c55e" }}
                          >
                            <svg viewBox="0 0 10 10" className="h-2 w-2 fill-none stroke-white stroke-[2.5]">
                              <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9B8EC4]">+{user.phone}</p>
                      </div>
                    </div>

                    {/* menu items */}
                    <div className="px-2 py-2">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#C9B8E8] transition-all hover:bg-white/5 hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-[#9B8EC4] stroke-2">
                          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                        </svg>
                        {t.myProfile}
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#C9B8E8] transition-all hover:bg-red-500/10 hover:text-red-400"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                          <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
                        </svg>
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── guest auth buttons ── */
              <>
                <button
                  onClick={() => onOpenAuth("login")}
                  className="inline-flex rounded-full border border-[#D4AF37]/60 px-2.5 py-1.5 text-xs font-medium text-[#E8CF7A] transition-all hover:bg-[#D4AF37]/10 sm:px-4 sm:py-2 sm:text-sm"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="inline-flex rounded-full bg-gradient-to-r from-[#9B30FF] via-[#7B2FBE] to-[#4A0E8F] px-2.5 py-1.5 text-xs font-semibold shadow-[0_0_14px_#7B2FBE60] transition-all hover:shadow-[0_0_22px_#9B30FF90] sm:px-5 sm:py-2 sm:text-sm"
                >
                  {t.register}
                </button>
              </>
            )}

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
                <Image src={logo} alt="2XLbet Casino" width={80} height={80} className="h-9 w-auto" />
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
                      <Link
                        href={NAV_HREFS[idx] ?? "#"}
                        onClick={() => { if (!hasDropdown) setMobileOpen(false); }}
                        className="flex-1 px-3 py-3 transition-colors hover:text-[#F5C842]"
                      >
                        {n}
                      </Link>
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

            <div className="mt-auto pt-6">
              {user ? (
                /* logged-in state in drawer */
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(123,47,190,0.1)",
                    border: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-black text-[#0A0612]"
                        style={{ background: "linear-gradient(135deg, #D4AF37, #F5C842)" }}
                      >
                        {user.name[0].toUpperCase()}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background: "#22c55e", border: "2px solid #0A0612" }}
                      >
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-none stroke-white stroke-2">
                          <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-white">{user.name}</p>
                        <span
                          className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                          style={{ background: "#22c55e" }}
                        >
                          <svg viewBox="0 0 10 10" className="h-2 w-2 fill-none stroke-white stroke-2">
                            <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#9B8EC4]">+{user.phone}</p>
                    </div>
                  </div>

                  {/* balance card */}
                  <div
                    className="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.18)" }}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.balance}</p>
                      <p className="text-xl font-black text-[#F5C842]">{user.balance}</p>
                    </div>
                    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-[#D4AF37]/40 stroke-[1.5]">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 3H8a2 2 0 0 0-2 4h12a2 2 0 0 0-2-4z" />
                      <circle cx="16" cy="14" r="1.5" className="fill-[#D4AF37]/40 stroke-none" />
                    </svg>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="mb-2 flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-[#C9B8E8] transition-all hover:bg-white/10 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-[#9B8EC4] stroke-2">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                    </svg>
                    {t.myProfile}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                      <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
                    </svg>
                    {t.logout}
                  </button>
                </div>
              ) : (
                /* guest state in drawer */
                <div className="flex flex-col gap-3">
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
