"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaCrown, FaLock } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getVipTiers, getMyVipStatus, type VipTier, type VipStatus } from "@/lib/vip";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};

const GROUP_COLORS: Record<string, { from: string; to: string }> = {
  Newcomer: { from: "#6B5B95", to: "#9B8EC4" },
  Bronze: { from: "#8C5A2B", to: "#C98A4B" },
  Silver: { from: "#9CA3AF", to: "#E5E7EB" },
  Gold: { from: "#D4AF37", to: "#F5C842" },
  Platinum: { from: "#7DD3E8", to: "#CFF3FA" },
  Diamond: { from: "#9B30FF", to: "#F5C842" },
};

export default function VipPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [status, setStatus] = useState<VipStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getVipTiers()
      .then((list) => { if (!cancelled) setTiers(list); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) { setStatus(null); return; }
    let cancelled = false;
    getMyVipStatus()
      .then((s) => { if (!cancelled) setStatus(s); })
      .catch(() => { if (!cancelled) setStatus(null); });
    return () => { cancelled = true; };
  }, [user]);

  const t =
    lang === "bn"
      ? {
          back: "ফিরে যান",
          title: "ভিআইপি লেভেল",
          subtitle: "জমা ও বাজি অনুযায়ী স্বয়ংক্রিয়ভাবে লেভেল বৃদ্ধি পায়",
          yourLevel: "আপনার বর্তমান লেভেল",
          deposit: "প্রয়োজনীয় জমা",
          bet: "প্রয়োজনীয় বাজি",
          bonus: "লেভেল বোনাস",
          turnover: "টার্নওভার",
          current: "বর্তমান",
        }
      : {
          back: "Back",
          title: "VIP Levels",
          subtitle: "Your level rises automatically as your lifetime deposit and bet totals grow",
          yourLevel: "Your current level",
          deposit: "Required deposit",
          bet: "Required bet",
          bonus: "Level bonus",
          turnover: "Turnover",
          current: "Current",
        };

  const groups = Array.from(new Set(tiers.map((t) => t.groupName)));

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-5xl">
          <Link href="/profile" className="mb-4 flex w-fit items-center gap-1.5 text-xs font-semibold text-[#9B8EC4] transition-colors hover:text-[#F5C842]">
            <FaChevronLeft className="text-[10px]" /> {t.back}
          </Link>

          <h1 className="mb-1.5 flex items-center gap-2 text-lg font-extrabold text-white">
            <FaCrown className="text-[#D4AF37]" /> {t.title}
          </h1>
          <p className="mb-6 text-xs text-[#7B5EA7]">{t.subtitle}</p>

          {status && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl px-5 py-4" style={CARD}>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black text-[#0A0612]"
                style={{
                  background: `linear-gradient(135deg, ${(GROUP_COLORS[status.current.groupName] ?? GROUP_COLORS.Bronze).from}, ${(GROUP_COLORS[status.current.groupName] ?? GROUP_COLORS.Bronze).to})`,
                }}
              >
                {status.current.level}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.yourLevel}</p>
                <p className="text-sm font-extrabold text-white">
                  VIP {status.current.level} · {lang === "bn" ? status.current.nameBn : status.current.nameEn}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl" style={CARD} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map((groupName) => {
                const colors = GROUP_COLORS[groupName] ?? GROUP_COLORS.Bronze;
                const groupTiers = tiers.filter((tr) => tr.groupName === groupName);
                return (
                  <section key={groupName}>
                    <h2
                      className="mb-3 text-sm font-black uppercase tracking-wide"
                      style={{ color: colors.from }}
                    >
                      {groupName}
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {groupTiers.map((tier) => {
                        const isCurrent = status?.current.level === tier.level;
                        const isLocked = status ? status.current.level < tier.level : false;
                        return (
                          <div
                            key={tier.level}
                            className="rounded-2xl p-4"
                            style={{
                              ...CARD,
                              border: isCurrent ? `1px solid ${colors.from}` : CARD.border,
                              boxShadow: isCurrent ? `0 0 24px ${colors.from}44` : CARD.boxShadow,
                            }}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-[#0A0612]"
                                  style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                                >
                                  {tier.level}
                                </div>
                                <p className="text-sm font-bold text-white">
                                  {lang === "bn" ? tier.nameBn : tier.nameEn}
                                </p>
                              </div>
                              {isCurrent && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-[#0A0612]" style={{ background: colors.from }}>
                                  {t.current}
                                </span>
                              )}
                              {isLocked && <FaLock className="text-[10px] text-[#7B5EA7]" />}
                            </div>
                            <div className="space-y-1 text-[11px] text-[#9B8EC4]">
                              <p>{t.deposit}: ৳{Math.round(Number(tier.requiredDeposit)).toLocaleString()}</p>
                              <p>{t.bet}: ৳{Math.round(Number(tier.requiredBet)).toLocaleString()}</p>
                              {Number(tier.bonusAmount) > 0 && (
                                <p>{t.bonus}: ৳{Math.round(Number(tier.bonusAmount)).toLocaleString()} ({t.turnover} {tier.turnoverMultiplier}x)</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
