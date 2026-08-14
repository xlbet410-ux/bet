"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaGift } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getMyBonuses, forfeitBonus, type MyBonusesResponse, type MyBonus } from "@/lib/offers";

const CARD = { background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(17,17,17,.06)" };
const INNER = { background: "#F9FAFB", border: "1px solid #E5E7EB" };

function progressPercent(b: MyBonus): number {
  const required = Number(b.turnoverRequired);
  if (required <= 0) return 100;
  return Math.min(100, (Number(b.turnoverDone) / required) * 100);
}

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export default function MyBonusesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [data, setData] = useState<MyBonusesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingForfeit, setConfirmingForfeit] = useState<MyBonus | null>(null);
  const [forfeiting, setForfeiting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    getMyBonuses()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleForfeit() {
    if (!confirmingForfeit) return;
    setForfeiting(true);
    try {
      await forfeitBonus(confirmingForfeit.id);
      const res = await getMyBonuses();
      setData(res);
      setConfirmingForfeit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setForfeiting(false);
    }
  }

  const t =
    lang === "bn"
      ? {
          back: "ফিরে যান",
          title: "আপনার বোনাস",
          active: "সক্রিয় বোনাস",
          queued: "অপেক্ষায়",
          queuedDesc: "বর্তমান বোনাস শেষ হলে এগুলো স্বয়ংক্রিয়ভাবে সক্রিয় হবে",
          history: "ইতিহাস",
          turnover: "টার্নওভার",
          daysLeft: "দিন বাকি",
          forfeit: "বোনাস বাতিল করুন",
          forfeitConfirmTitle: "বোনাস বাতিল করবেন?",
          forfeitConfirmDesc: "এই বোনাসের টাকা ফেরত পাবেন না এবং বাকি টার্নওভার মুছে যাবে। এটি ফেরানো যাবে না।",
          cancel: "বাতিল",
          confirm: "নিশ্চিত করুন",
          none: "এখনো কোনো বোনাস নেই।",
          completed: "সম্পন্ন",
          forfeited: "বাতিল করা হয়েছে",
          expired: "মেয়াদোত্তীর্ণ",
        }
      : {
          back: "Back",
          title: "Your Bonuses",
          active: "Active Bonus",
          queued: "Queued",
          queuedDesc: "These activate automatically once your current bonus completes",
          history: "History",
          turnover: "Turnover",
          daysLeft: "days left",
          forfeit: "Forfeit bonus",
          forfeitConfirmTitle: "Forfeit this bonus?",
          forfeitConfirmDesc: "You won't get this bonus amount back, and its remaining turnover is cleared. This can't be undone.",
          cancel: "Cancel",
          confirm: "Confirm",
          none: "No bonuses yet.",
          completed: "Completed",
          forfeited: "Forfeited",
          expired: "Expired",
        };

  if (!user) return null;

  const history = data ? [...data.completed, ...data.forfeited, ...data.expired] : [];

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

          <h1 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <FaGift className="text-[#D4AF37]" /> {t.title}
          </h1>

          {error && <p className="mb-4 text-center text-xs text-red-500">{error}</p>}

          {loading ? (
            <div className="rounded-2xl p-6 text-center text-sm text-gray-400" style={CARD}>
              ...
            </div>
          ) : !data || (!data.active && data.queued.length === 0 && history.length === 0) ? (
            <div className="rounded-2xl p-8 text-center text-sm text-gray-400" style={CARD}>
              {t.none}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {data.active && (
                <section>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.active}</p>
                  <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#fff7e0,#ffffff)", border: "1px solid #D4AF37" }}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{data.active.type}</p>
                        <p className="text-2xl font-black text-[#9A7B1F]">৳{Number(data.active.amount).toLocaleString()}</p>
                      </div>
                      {daysLeft(data.active.expiresAt) !== null && (
                        <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-gray-500" style={INNER}>
                          {daysLeft(data.active.expiresAt)} {t.daysLeft}
                        </span>
                      )}
                    </div>

                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {t.turnover}: ৳{Number(data.active.turnoverDone).toLocaleString()} / ৳{Number(data.active.turnoverRequired).toLocaleString()}
                      </span>
                      <span>{progressPercent(data.active).toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-2.5 rounded-full" style={{ width: `${progressPercent(data.active)}%`, background: "linear-gradient(to right,#D4AF37,#F5C842)" }} />
                    </div>

                    <button
                      onClick={() => setConfirmingForfeit(data.active)}
                      className="mt-3 text-xs font-semibold text-red-500 underline underline-offset-2"
                    >
                      {t.forfeit}
                    </button>
                  </div>
                </section>
              )}

              {data.queued.length > 0 && (
                <section>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {t.queued} ({data.queued.length})
                  </p>
                  <p className="mb-2 text-xs text-gray-400">{t.queuedDesc}</p>
                  <div className="flex flex-col gap-2">
                    {data.queued.map((b, i) => (
                      <div key={b.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
                        <div>
                          <p className="text-[10px] text-gray-400">#{i + 2}</p>
                          <p className="text-sm font-bold text-gray-800">{b.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#9A7B1F]">৳{Number(b.amount).toLocaleString()}</p>
                          <p className="text-[11px] text-gray-400">
                            {t.turnover}: ৳{Number(b.turnoverRequired).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {history.length > 0 && (
                <details>
                  <summary className="mb-2 cursor-pointer text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {t.history} ({history.length})
                  </summary>
                  <div className="flex flex-col gap-1.5">
                    {history.map((b) => (
                      <div key={b.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs" style={INNER}>
                        <span className="text-gray-600">{b.type}</span>
                        <span className="tabular-nums text-gray-500">৳{Number(b.amount).toLocaleString()}</span>
                        <span
                          className={`font-semibold ${
                            b.status === "completed" ? "text-green-600" : b.status === "forfeited" ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {b.status === "completed" ? t.completed : b.status === "forfeited" ? t.forfeited : t.expired}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </main>

      {confirmingForfeit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmingForfeit(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5" style={CARD}>
            <p className="mb-2 text-sm font-bold text-gray-900">{t.forfeitConfirmTitle}</p>
            <p className="mb-4 text-xs leading-relaxed text-gray-500">{t.forfeitConfirmDesc}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingForfeit(null)}
                className="rounded-full border border-gray-300 px-4 py-2 text-xs font-bold text-gray-600"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleForfeit}
                disabled={forfeiting}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {forfeiting ? "..." : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
