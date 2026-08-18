"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUserGroup, FaBolt } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useLang } from "@/lib/language";
import { getOffersByGroup, getOffers, type GroupOffer, type PublicOffer } from "@/lib/offers";
import { getVipTiers, type VipTier } from "@/lib/vip";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};
const GOLD = "#F5C842";

// One "Label | Value" row per line — same convention/parser as
// OfferDetailModal uses for the bonusInfoBn field.
function parseBonusInfoRows(text: string | null): { label: string; value: string }[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf("|");
      if (i === -1) return null;
      const label = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => row !== null);
}

function toBullets(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function groupVipTiers(tiers: VipTier[]) {
  const groups: VipTier[] = [];
  let prevGroup: string | null = null;
  for (const t of tiers) {
    if (t.groupName !== prevGroup) {
      groups.push(t);
      prevGroup = t.groupName;
    }
  }
  return groups;
}

function pct(v: string) {
  const n = Math.round(Number(v) * 100 * 100) / 100;
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/0$/, "")}%`;
}

function money(v: string | number) {
  return `৳${Math.round(Number(v)).toLocaleString()}`;
}

export default function ReferralProgramPage() {
  const { lang } = useLang();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const [ladder, setLadder] = useState<GroupOffer[]>([]);
  const [flatOffer, setFlatOffer] = useState<PublicOffer | null>(null);
  const [vipTiers, setVipTiers] = useState<VipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const [ladderRows, offers, tiers] = await Promise.all([
            getOffersByGroup("referral-milestones"),
            getOffers("referral"),
            getVipTiers(),
          ]);
          if (!cancelled) {
            setLadder(ladderRows);
            setFlatOffer(offers.find((o) => o.slug === "refer-earn-1000") ?? null);
            setVipTiers(tiers);
            setLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setError(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const t =
    lang === "bn"
      ? {
          title: "রেফারেল প্রোগ্রাম",
          intro:
            "রেফারেল থেকে তিনভাবে আয় করুন — আপনার মোট সফল রেফারেল বাড়ার সাথে সাথে এককালীন মাইলফলক বোনাস, প্রতিটি যোগ্য রেফারেলে একটি চলমান ফ্ল্যাট বোনাস, এবং আপনার নিজের ভিআইপি লেভেলের ভিত্তিতে রেফার করা খেলোয়াড়দের কার্যকলাপ থেকে ক্রমাগত কমিশন।",
          milestoneTitle: "এককালীন রেফারেল মাইলফলক",
          milestoneBadge: "কোনো ওয়েজারিং নেই — তাৎক্ষণিক উত্তোলনযোগ্য",
          milestoneCol1: "মাইলফলক (সফল রেফারেল)",
          milestoneCol2: "এককালীন বোনাস",
          milestoneOrdinal: (n: number) => `${n} তম`,
          milestoneFacts: [
            "একজন রেফারেল তখনই গণনা হবে যখন আপনার বন্ধু ডিপোজিট করে তাদের প্রথম ভিআইপি লেভেল-আপে পৌঁছাবেন — শুধু সাইনআপেই নয়।",
            "প্রতিটি মাইলফলক বোনাস প্রতি খেলোয়াড় ঠিক একবার পাওয়া যাবে, আপনার সঞ্চিত সফল রেফারেল সংখ্যা ঠিক সেই মাইলফলকে পৌঁছালে।",
            "এই বোনাসগুলোর জন্য কোনো ওয়েজারিং প্রয়োজন নেই — সাইটের অন্যান্য বোনাস থেকে এটি সত্যিকার অর্থেই আলাদা।",
            "মাইলফলক অর্জনের ৩০ দিনের মধ্যে বোনাস দাবি করতে হবে।",
          ],
          flatTitle: "রেফার করুন ও ৳1,000 আয় করুন",
          flatDesc: "উপরের মাইলফলক সিঁড়ি থেকে আলাদা একটি চলমান অফার — প্রতিটি পৃথক যোগ্য রেফারেলে পুরস্কার দেয়, নির্দিষ্ট সঞ্চিত সংখ্যায় নয়, এবং সীমাহীনবার পুনরাবৃত্তি করা যায়।",
          flatCol1: "বিবরণ",
          flatCol2: "মান",
          vipTitle: "চলমান ভিআইপি-লেভেল রেফারেল কমিশন",
          vipDesc: "এটি একটি দাবিযোগ্য অফার নয় — প্রতিনিয়ত ব্যাকগ্রাউন্ডে চলে এবং সম্পূর্ণভাবে আপনার নিজের ভিআইপি লেভেলের উপর নির্ভরশীল। সম্পূর্ণ ৫১-লেভেল বিভাজনের জন্য",
          vipLink: "ভিআইপি লেভেল পেজ দেখুন",
          vipCol1: "স্তর পরিবার",
          vipCol2: "রেফারেল সাইনআপ বোনাস",
          vipCol3: "বেট কমিশন T1 / T2 / T3",
          depositCommissionLabel: "ফ্ল্যাট ডিপোজিট কমিশন",
          depositCommissionDesc: "আপনার প্রত্যক্ষ রেফারেল করা প্রতিটি অনুমোদিত ডিপোজিটে — সব ভিআইপি লেভেলে একই হার, লেভেলের সাথে পরিবর্তিত হয় না।",
          howTitle: "কীভাবে রেফার করবেন",
          howSteps: [
            "প্রোফাইল → রেফারেল ট্যাবে যান।",
            "আপনার রেফারেল কোড বা লিংক কপি করুন।",
            "শেয়ার বাটন ব্যবহার করে বন্ধুদের সাথে শেয়ার করুন।",
            "আপনার বন্ধু রেজিস্টার করে ডিপোজিট ও ওয়েজার সম্পন্ন করলে পুরস্কার স্বয়ংক্রিয়ভাবে ট্রিগার হয় — আলাদা কোনো দাবি করার প্রয়োজন নেই।",
          ],
          viewMyReferrals: "আপনার রেফারেল ও আয় দেখুন",
          termsTitle: "শর্তাবলী",
          err: "লোড করা যায়নি।",
          tryAgain: "আবার চেষ্টা করুন",
        }
      : {
          title: "Referral Program",
          intro:
            "Earn from referrals in three ways — one-time milestone bonuses as your total successful referrals grow, an ongoing flat bonus for every qualifying referral, and continuous commission from your referred players' activity based on your own VIP level.",
          milestoneTitle: "One-Time Referral Milestones",
          milestoneBadge: "No wagering required — instantly withdrawable",
          milestoneCol1: "Milestone (successful referrals)",
          milestoneCol2: "One-Time Bonus",
          milestoneOrdinal: (n: number) => ordinal(n),
          milestoneFacts: [
            "A referral only counts toward these milestones once your friend deposits and reaches their first VIP level-up — not just at signup.",
            "Each milestone bonus fires exactly once per user, the moment your cumulative successful-referral count hits that exact number.",
            "No wagering requirement on these bonuses — genuinely different from the site's other bonuses.",
            "Must be claimed within 30 days of the milestone firing.",
          ],
          flatTitle: "Refer & Earn ৳1,000",
          flatDesc: "A separate, ongoing offer from the milestone ladder above — pays per individual qualifying referral rather than at fixed cumulative-count thresholds, and repeats unlimited times.",
          flatCol1: "Detail",
          flatCol2: "Value",
          vipTitle: "Ongoing VIP-Tier Referral Commission",
          vipDesc: "Not a claimable offer — runs continuously in the background and is driven entirely by your own VIP level. For the full 51-level breakdown, see the",
          vipLink: "VIP Level page",
          vipCol1: "Tier family",
          vipCol2: "Referral Signup Bonus",
          vipCol3: "Bet Commission T1 / T2 / T3",
          depositCommissionLabel: "Flat deposit commission",
          depositCommissionDesc: "On every approved deposit your direct referrals make — the same rate at every VIP level, doesn't scale with your tier.",
          howTitle: "How to Refer",
          howSteps: [
            "Go to Profile → Referral tab.",
            "Copy your referral code or link.",
            "Share it with friends using the share buttons.",
            "Rewards trigger automatically once your friend registers, deposits, and wagers — no separate claim needed.",
          ],
          viewMyReferrals: "View your referrals & earnings",
          termsTitle: "Terms & Conditions",
          err: "Couldn't load the referral program.",
          tryAgain: "Try again",
        };

  const flatRows = flatOffer ? parseBonusInfoRows(lang === "bn" ? flatOffer.bonusInfoBn : flatOffer.bonusInfoEn ?? flatOffer.bonusInfoBn) : [];
  const vipGroups = groupVipTiers(vipTiers);
  const depositCommissionPct = vipTiers[0]?.referralDepositCommissionPct;

  const milestoneTerms = ladder[0] ? (lang === "bn" ? ladder[0].termsBn : ladder[0].termsEn ?? ladder[0].termsBn) : null;
  const flatTerms = flatOffer ? (lang === "bn" ? flatOffer.termsBn : flatOffer.termsEn ?? flatOffer.termsBn) : null;
  const vipTermsNote =
    lang === "bn"
      ? "ভিআইপি-লেভেল কমিশন শুধুমাত্র নিষ্পত্তিকৃত/যোগ্য বেটের উপর গণনা করা হয় এবং আপনার ভিআইপি লেভেলের সাথে স্বয়ংক্রিয়ভাবে স্কেল করে — কোনো আলাদা দাবি প্রয়োজন নেই।"
      : "VIP-tier commissions are calculated on settled/eligible bets only, and scale automatically with your VIP level — no separate claim needed.";

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-35 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-white">
            <FaUserGroup className="text-[#D4AF37]" /> {t.title}
          </h1>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[#C9B8E8]">{t.intro}</p>

          {loading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl" style={CARD} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center text-sm text-[#7B5EA7]" style={CARD}>
              <p>{t.err}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
              >
                {t.tryAgain}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Section 2: One-Time Milestones */}
              <div className="rounded-2xl p-5" style={CARD}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold" style={{ color: GOLD }}>
                    {t.milestoneTitle}
                  </h2>
                  <span
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-[#0A0612]"
                    style={{ background: GOLD }}
                  >
                    <FaBolt className="text-[10px]" /> {t.milestoneBadge}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(255,255,255,.08)" }}>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#9B8EC4]" style={{ background: "#150a2b", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                          {t.milestoneCol1}
                        </th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#9B8EC4]" style={{ background: "#150a2b", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                          {t.milestoneCol2}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ladder.map((o, i) => {
                        const tier = (o.triggerConfig as { tier?: number } | null)?.tier ?? 0;
                        return (
                          <tr key={o.id} style={{ background: i % 2 === 1 ? "rgba(255,255,255,.015)" : undefined, borderTop: "1px solid rgba(255,255,255,.05)" }}>
                            <td className="px-3 py-2.5 text-left font-semibold text-white">{t.milestoneOrdinal(tier)}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums font-bold" style={{ color: GOLD }}>
                              {money(o.rewardAmount ?? 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <ul className="mt-4 flex flex-col gap-2 text-xs leading-relaxed text-[#C9B8E8]">
                  {t.milestoneFacts.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span style={{ color: GOLD }}>•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3: Refer & Earn 1000 */}
              {flatOffer && (
                <div className="rounded-2xl p-5" style={CARD}>
                  <h2 className="mb-1.5 text-sm font-bold" style={{ color: GOLD }}>
                    {t.flatTitle}
                  </h2>
                  <p className="mb-3 text-xs leading-relaxed text-[#C9B8E8]">{t.flatDesc}</p>
                  <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(255,255,255,.08)" }}>
                    {flatRows.map((row, i) => (
                      <div key={row.label} className="grid grid-cols-2" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,.08)" : undefined }}>
                        <div className="px-3.5 py-2.5 text-sm font-medium" style={{ background: GOLD, color: "#1A1A1A" }}>
                          {row.label}
                        </div>
                        <div className="px-3.5 py-2.5 text-right text-sm text-[#E8DFF5]" style={{ background: "rgba(255,255,255,.03)" }}>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: VIP-tier commission */}
              <div className="rounded-2xl p-5" style={CARD}>
                <h2 className="mb-1.5 text-sm font-bold" style={{ color: GOLD }}>
                  {t.vipTitle}
                </h2>
                <p className="mb-3 text-xs leading-relaxed text-[#C9B8E8]">
                  {t.vipDesc}{" "}
                  <Link href="/vip-level" className="font-semibold underline" style={{ color: GOLD }}>
                    {t.vipLink}
                  </Link>
                  .
                </p>

                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(255,255,255,.08)" }}>
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr>
                        {[t.vipCol1, t.vipCol2, t.vipCol3].map((h, i) => (
                          <th
                            key={h}
                            className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9B8EC4] ${i === 0 ? "text-left" : "text-right"}`}
                            style={{ background: "#150a2b", borderBottom: "1px solid rgba(255,255,255,.08)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vipGroups.map((g, i) => (
                        <tr key={g.groupName} style={{ background: i % 2 === 1 ? "rgba(255,255,255,.015)" : undefined, borderTop: "1px solid rgba(255,255,255,.05)" }}>
                          <td className="px-3 py-2.5 text-left font-semibold text-white">{g.groupName}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: GOLD }}>
                            {money(g.referralSignupBonus)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">
                            {pct(g.referralBetCommissionPct)} / {pct(g.referralBetCommissionPctTier2)} / {pct(g.referralBetCommissionPctTier3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {depositCommissionPct && (
                  <div className="mt-4 flex items-center justify-between rounded-xl p-3.5" style={{ background: "rgba(212,175,55,.08)", border: "1px solid rgba(212,175,55,.25)" }}>
                    <div>
                      <p className="text-sm font-bold text-white">{t.depositCommissionLabel}</p>
                      <p className="mt-0.5 max-w-md text-xs text-[#C9B8E8]">{t.depositCommissionDesc}</p>
                    </div>
                    <p className="shrink-0 text-xl font-black tabular-nums" style={{ color: GOLD }}>
                      {pct(depositCommissionPct)}
                    </p>
                  </div>
                )}
              </div>

              {/* Section 5: How to Refer */}
              <div className="rounded-2xl p-5" style={CARD}>
                <h2 className="mb-3 text-sm font-bold" style={{ color: GOLD }}>
                  {t.howTitle}
                </h2>
                <ol className="flex flex-col gap-2 text-sm text-[#E8DFF5]">
                  {t.howSteps.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0A0612]"
                        style={{ background: GOLD }}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Link href="/referral" className="mt-4 inline-block text-xs font-semibold underline" style={{ color: GOLD }}>
                  {t.viewMyReferrals} →
                </Link>
              </div>

              {/* Section 6: Terms */}
              <div className="rounded-2xl p-5" style={CARD}>
                <h2 className="mb-3 text-sm font-bold" style={{ color: GOLD }}>
                  {t.termsTitle}
                </h2>
                <ul className="flex flex-col gap-2 text-xs leading-relaxed text-[#9B8EC4]">
                  {[...toBullets(milestoneTerms), ...toBullets(flatTerms), vipTermsNote].map((term, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: GOLD }}>•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
