"use client";

import { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getVipTiers, getMyVipStatus, type VipTier } from "@/lib/vip";
import { VipLevelTable } from "@/components/vip/VipLevelTable";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};

export default function VipLevelPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const t =
    lang === "bn"
      ? {
          title: "ভিআইপি প্রোগ্রাম",
          intro:
            "ডিপোজিট করে এবং বেট খেলে লেভেল বাড়ান। প্রতিটি লেভেলে একটি লেভেল-আপ বোনাস, একটি রেফারেল সাইনআপ বোনাস, স্তরভিত্তিক বেট কমিশন (রিবেট) এবং দৈনিক ক্যাশব্যাক আনলক হয়। উচ্চতর লেভেলের জন্য বেশি সঞ্চিত ডিপোজিট/বেট প্রয়োজন হয়, কিন্তু পুরস্কারও সেই অনুপাতে বড় হয়।",
          tableTitle: "ভিআইপি লেভেল টেবিল",
          howTitle: "লেভেল যেভাবে কাজ করে",
          how: [
            [
              "“প্রয়োজনীয় ডিপোজিট” ও “প্রয়োজনীয় বেট”",
              "সেই লেভেলে পৌঁছাতে প্রয়োজনীয় সঞ্চিত/লাইফটাইম মোট পরিমাণ — কোনো একক লেনদেনের অঙ্ক নয়।",
            ],
            [
              "“ওয়েজার”",
              "লেভেল-আপ বোনাসে প্রযোজ্য টার্নওভার মাল্টিপ্লায়ার, উত্তোলনযোগ্য হওয়ার আগে পূরণ করতে হবে (যেমন ২x মানে বোনাসের পরিমাণ দুইবার বাজি ধরতে হবে)।",
            ],
            [
              "“মেয়াদ”",
              "লেভেল-আপ বোনাস পাওয়ার পর সেই ওয়েজারিং শর্ত পূরণ করার জন্য খেলোয়াড়ের হাতে থাকা দিনের সংখ্যা।",
            ],
            [
              "“বেট কমিশন T1 / T2 / T3”",
              "রেফার করা খেলোয়াড়দের বেটের ওপর স্তরভিত্তিক রেফারেল/এজেন্ট কমিশন হার (T1 = সরাসরি রেফারেল, T2 = দ্বিতীয় স্তর, T3 = তৃতীয় স্তর)।",
            ],
            [
              "“দৈনিক ক্যাশব্যাক”",
              "সেই লেভেলে যোগ্য লস/টার্নওভারের ওপর একটি দৈনিক রিবেট শতাংশ।",
            ],
          ],
          termsTitle: "শর্তাবলী",
          terms: [
            "বোনাস ও ক্যাশব্যাক উপরের লেভেল-নির্দিষ্ট নিয়ম অনুযায়ী ক্রেডিট করা হয়।",
            "নির্ধারিত মেয়াদের মধ্যে ওয়েজারিং শর্ত পূরণ না হলে লেভেল-আপ বোনাস বাতিল হয়ে যেতে পারে।",
            "কমিশন ও ক্যাশব্যাক শুধুমাত্র যোগ্য/নিষ্পত্তিকৃত বেটের ওপর গণনা করা হয় — বাতিল/অকার্যকর বেট বাদ।",
            "লেভেল লাইফটাইম সঞ্চিত হিসাবে গণনা হয় এবং রিসেট হয় না।",
            "অপারেটর যেকোনো সময় ভিআইপি প্রোগ্রাম পরিবর্তন করার অধিকার সংরক্ষণ করে।",
          ],
          err: "লোড করা যায়নি।",
          tryAgain: "আবার চেষ্টা করুন",
        }
      : {
          title: "VIP Program",
          intro:
            "Level up by depositing and betting. Each level unlocks a level-up bonus, a referral signup bonus, tiered bet commission (rebate), and daily cashback. Higher levels require larger cumulative deposit/bet totals, but pay out proportionally larger rewards.",
          tableTitle: "VIP Level Table",
          howTitle: "How levels work",
          how: [
            ["“Required deposit” and “Required bet”", "Cumulative/lifetime totals needed to reach that level — not per-transaction."],
            ["“Wager”", "The turnover multiplier applied to that level's Level-up Bonus before it becomes withdrawable (e.g. 2x means the bonus amount must be wagered twice)."],
            ["“Validity”", "The number of days the player has to clear that wagering requirement after receiving the level-up bonus."],
            ["“Bet Commission T1 / T2 / T3”", "A tiered referral/agent commission rate paid on referred players' bets (T1 = direct referral, T2 = second level, T3 = third level)."],
            ["“Daily Cashback”", "A daily rebate percentage on qualifying losses/turnover at that level."],
          ],
          termsTitle: "Terms & Conditions",
          terms: [
            "Bonuses and cashback are credited per the level rules above.",
            "Wagering must be completed within the stated validity window, or the level-up bonus may be forfeited.",
            "Commission and cashback are calculated on eligible/settled bets only, excluding void or cancelled bets.",
            "Levels are lifetime cumulative and do not reset.",
            "The operator reserves the right to modify the VIP program at any time.",
          ],
          err: "Couldn't load VIP levels.",
          tryAgain: "Try again",
        };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getVipTiers();
          if (!cancelled) {
            setTiers(list);
            setLoading(false);
          }
          break;
        } catch {
          if (attempt === maxAttempts) {
            if (!cancelled) {
              setError(true);
              setLoading(false);
            }
          } else {
            await new Promise((r) => setTimeout(r, attempt * 700));
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  // Current-level highlight only makes sense for a logged-in player — the
  // table itself is public and renders fine without it.
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setCurrentLevel(undefined);
      return;
    }
    getMyVipStatus()
      .then((status) => {
        if (!cancelled) setCurrentLevel(status.level);
      })
      .catch(() => {
        if (!cancelled) setCurrentLevel(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-35 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-white">
            <FaCrown className="text-[#D4AF37]" /> {t.title}
          </h1>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[#C9B8E8]">{t.intro}</p>

          <h2 className="mb-3 text-sm font-bold text-[#F5C842]">{t.tableTitle}</h2>

          {loading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl" style={CARD} />
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
            <VipLevelTable tiers={tiers} lang={lang} currentLevel={currentLevel} />
          )}

          <div className="mt-8 rounded-2xl p-5" style={CARD}>
            <h2 className="mb-3 text-sm font-bold text-[#F5C842]">{t.howTitle}</h2>
            <dl className="flex flex-col gap-3">
              {t.how.map(([term, desc]) => (
                <div key={term}>
                  <dt className="text-sm font-semibold text-white">{term}</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-[#C9B8E8]">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 rounded-2xl p-5" style={CARD}>
            <h2 className="mb-3 text-sm font-bold text-[#F5C842]">{t.termsTitle}</h2>
            <ul className="flex flex-col gap-2 text-xs leading-relaxed text-[#9B8EC4]">
              {t.terms.map((term) => (
                <li key={term} className="flex gap-2">
                  <span className="text-[#F5C842]">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
