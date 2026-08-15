"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaUserGroup, FaCopy, FaCheck } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import ShareLinkBar from "@/components/site/ShareLinkBar";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getReferralStats, type ReferralStats } from "@/lib/referral";

const CARD = { background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(17,17,17,.06)" };
const INNER = { background: "#F9FAFB", border: "1px solid #E5E7EB" };

const STATUS_LABEL: Record<string, { en: string; bn: string; color: string }> = {
  pending: { en: "Pending", bn: "অপেক্ষায়", color: "#9CA3AF" },
  milestone_met: { en: "Active", bn: "সক্রিয়", color: "#22c55e" },
  fraud_flagged: { en: "Under review", bn: "পর্যালোচনায়", color: "#f59e0b" },
};

export default function ReferralPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getReferralStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const t = lang === "bn"
    ? {
        back: "ফিরে যান",
        title: "রেফারেল প্রোগ্রাম",
        subtitle: "বন্ধুদের আমন্ত্রণ জানান, তারা সক্রিয় হলে বোনাস পান এবং তাদের বাজি থেকে কমিশন আয় করুন",
        yourLink: "আপনার রেফারেল লিংক",
        copy: "কপি করুন",
        copied: "কপি হয়েছে!",
        shareVia: "শেয়ার করুন",
        instagramHint: "লিংক কপি হয়েছে! আপনার ইনস্টাগ্রাম বায়ো বা স্টোরিতে পেস্ট করুন।",
        totalReferrals: "মোট রেফারেল",
        active: "সক্রিয়",
        pending: "অপেক্ষায়",
        signupBonus: "সাইনআপ বোনাস",
        betCommission: "বাজি কমিশন",
        lifetimeEarned: "মোট আয়",
        yourReferrals: "আপনার রেফারেলগুলো",
        noReferrals: "এখনো কোনো রেফারেল নেই। উপরের লিংক শেয়ার করুন!",
        joined: "যোগ দিয়েছে",
        recentCommissions: "সাম্প্রতিক কমিশন",
        noCommissions: "এখনো কোনো কমিশন নেই।",
        milestoneNote: "একজন বন্ধু VIP লেভেল ১ এ পৌঁছালে আপনি সাইনআপ বোনাস পাবেন",
      }
    : {
        back: "Back",
        title: "Referral Program",
        subtitle: "Invite friends, earn a bonus when they become active, and commission from their bets",
        yourLink: "Your referral link",
        copy: "Copy",
        copied: "Copied!",
        shareVia: "Share via",
        instagramHint: "Link copied! Paste it in your Instagram bio or story.",
        totalReferrals: "Total referrals",
        active: "Active",
        pending: "Pending",
        signupBonus: "Signup bonus",
        betCommission: "Bet commission",
        lifetimeEarned: "Lifetime earned",
        yourReferrals: "Your Referrals",
        noReferrals: "No referrals yet. Share your link above!",
        joined: "Joined",
        recentCommissions: "Recent Commissions",
        noCommissions: "No commissions yet.",
        milestoneNote: "You earn the signup bonus once a friend reaches VIP level 1",
      };

  if (!user) return null;

  const referralLink = stats ? `${window.location.origin}/?ref=${stats.referralCode}` : "";

  function handleCopy() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen bg-white px-4 pb-20 pt-35 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-2xl">
          <Link href="/profile" className="mb-4 flex w-fit items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-[#B8892E]">
            <FaChevronLeft className="text-[10px]" /> {t.back}
          </Link>

          <h1 className="mb-1.5 flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <FaUserGroup className="text-[#D4AF37]" /> {t.title}
          </h1>
          <p className="mb-5 text-xs text-gray-500">{t.subtitle}</p>

          {error && <p className="mb-4 text-center text-xs text-red-500">{error}</p>}

          {loading ? (
            <div className="rounded-2xl p-6 text-center text-sm text-gray-400" style={CARD}>...</div>
          ) : stats ? (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#fff7e0,#ffffff)", border: "1px solid #D4AF37" }}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">{t.yourLink}</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={referralLink} className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-700" />
                  <button
                    onClick={handleCopy}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0A0612]"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
                  >
                    {copied ? <FaCheck /> : <FaCopy />} {copied ? t.copied : t.copy}
                  </button>
                </div>

                <div className="mt-3.5 flex items-center gap-2.5">
                  <span className="text-[11px] font-medium text-gray-500">{t.shareVia}</span>
                  <ShareLinkBar link={referralLink} instagramHint={t.instagramHint} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl p-3.5 text-center" style={INNER}>
                  <p className="text-xl font-black text-gray-900">{stats.counts.total}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">{t.totalReferrals}</p>
                </div>
                <div className="rounded-xl p-3.5 text-center" style={INNER}>
                  <p className="text-xl font-black text-green-600">{stats.counts.milestoneMet}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">{t.active}</p>
                </div>
                <div className="rounded-xl p-3.5 text-center" style={INNER}>
                  <p className="text-xl font-black text-gray-400">{stats.counts.pending}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">{t.pending}</p>
                </div>
                <div className="rounded-xl p-3.5 text-center" style={INNER}>
                  <p className="text-xl font-black text-[#9A7B1F]">৳{Number(stats.lifetimeCommissionEarned).toLocaleString()}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">{t.lifetimeEarned}</p>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={CARD}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t.signupBonus}</span>
                  <span className="font-bold text-gray-900">৳{Number(stats.currentTierPerks.referralSignupBonus).toLocaleString()}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t.betCommission}</span>
                  <span className="font-bold text-gray-900">{(Number(stats.currentTierPerks.referralBetCommissionPct) * 100).toFixed(2)}%</span>
                </div>
                <p className="mt-3 text-[11px] text-gray-400">{t.milestoneNote}</p>
              </div>

              <section>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.yourReferrals}</p>
                {stats.referrals.length === 0 ? (
                  <p className="rounded-xl p-6 text-center text-sm text-gray-400" style={INNER}>{t.noReferrals}</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {stats.referrals.map((r) => {
                      const s = STATUS_LABEL[r.status];
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-lg px-3.5 py-2.5" style={INNER}>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{r.referredName}</p>
                            <p className="text-[11px] text-gray-400">{t.joined} {new Date(r.joinedAt).toLocaleDateString()}</p>
                          </div>
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${s.color}1A`, color: s.color }}>
                            {lang === "bn" ? s.bn : s.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.recentCommissions}</p>
                {stats.recentCommissions.length === 0 ? (
                  <p className="rounded-xl p-6 text-center text-sm text-gray-400" style={INNER}>{t.noCommissions}</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {stats.recentCommissions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs" style={INNER}>
                        <span className="text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                        <span className="font-bold text-[#9A7B1F]">+৳{Number(c.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
