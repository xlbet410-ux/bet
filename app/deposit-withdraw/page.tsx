"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { fmt } from "@/lib/format";
import { getActivePaymentAccounts, type PaymentAccount, type PaymentMethod } from "@/lib/paymentAccounts";

type PageTab = "deposit" | "withdraw";

const METHODS: { id: PaymentMethod; name: string; accent: string }[] = [
  { id: "bkash", name: "Bkash", accent: "#E2136E" },
  { id: "nagad", name: "Nagad", accent: "#F2631F" },
  { id: "rocket", name: "Rocket", accent: "#8C3494" },
  { id: "upay", name: "Upay", accent: "#F04E37" },
  { id: "crypto", name: "Crypto", accent: "#F7931A" },
  { id: "bank", name: "Bank", accent: "#22c55e" },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const CARD = { background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))", border: "1px solid rgba(255,255,255,.07)", boxShadow: "0 8px 32px rgba(0,0,0,.4)" };
const INNER = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" };

function Tick({ size = 10, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size }} className={`fill-none stroke-current stroke-2 ${className}`}>
      <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MethodGrid({ method, onSelect }: { method: PaymentMethod; onSelect: (id: PaymentMethod) => void }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {METHODS.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="rounded-xl py-3 text-xs font-bold transition-all"
          style={method === m.id
            ? { background: `${m.accent}25`, border: `1px solid ${m.accent}70`, color: "#fff", boxShadow: `0 0 20px ${m.accent}25` }
            : { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", color: "#9B8EC4" }}
        >
          {m.name}
        </button>
      ))}
    </div>
  );
}

function AmountPicker({
  amount,
  onSelect,
  onCustom,
  t,
}: {
  amount: string;
  onSelect: (v: string) => void;
  onCustom: (v: string) => void;
  t: ReturnType<typeof useLang>["t"];
}) {
  return (
    <>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileQuickAmount}</p>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => onSelect(String(amt))}
            className="rounded-xl py-2.5 text-sm font-bold transition-all"
            style={amount === String(amt)
              ? { background: "rgba(212,175,55,.15)", border: "1px solid rgba(212,175,55,.5)", color: "#F5C842" }
              : { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", color: "#9B8EC4" }}
          >
            ৳{amt.toLocaleString()}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileCustomAmount}</p>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#9B8EC4]">৳</span>
        <input
          type="number"
          min="100"
          value={amount}
          onChange={(e) => onCustom(e.target.value)}
          placeholder={t.profileEnterAmountPlaceholder}
          className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 py-3 pl-8 pr-4 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]"
        />
      </div>
    </>
  );
}

function SuccessPanel({ title, desc, onDone, t }: { title: string; desc: string; onDone: () => void; t: ReturnType<typeof useLang>["t"] }) {
  return (
    <div className="py-4 text-center">
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 0 30px rgba(34,197,94,.35)" }}
      >
        <Tick size={20} />
      </div>
      <h4 className="mb-1 text-lg font-extrabold text-white">{title}</h4>
      <p className="mb-6 text-sm text-[#9B8EC4]">{desc}</p>
      <button
        onClick={onDone}
        className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
        style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
      >
        {t.profileDone}
      </button>
    </div>
  );
}

export default function DepositWithdrawPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [pageTab, setPageTab] = useState<PageTab>("deposit");

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(false);
  const [accountsRetryKey, setAccountsRetryKey] = useState(0);

  // deposit
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>("bkash");
  const [depositAmt, setDepositAmt] = useState("");
  const [depositTrxId, setDepositTrxId] = useState("");
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  // withdraw
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>("bkash");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    function applyTabFromUrl() {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      if (fromUrl === "deposit" || fromUrl === "withdraw") setPageTab(fromUrl);
    }
    applyTabFromUrl();
  }, []);

  // The payment-accounts list rarely changes and this page can't function
  // without it, so retry a few times with backoff before giving up —
  // matches the pattern used for the game catalog on a cold backend.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setAccountsLoading(true);
      setAccountsError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getActivePaymentAccounts();
          if (!cancelled) {
            setAccounts(list);
            setAccountsLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setAccountsError(true);
        setAccountsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accountsRetryKey]);

  if (!user) return null;

  function copyText(value: string, id: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedAccountId(id);
      setTimeout(() => setCopiedAccountId((cur) => (cur === id ? null : cur)), 2000);
    });
  }

  const depositAccounts = accounts.filter((a) => a.method === depositMethod);
  const depositMethodName = METHODS.find((m) => m.id === depositMethod)?.name ?? "";
  const withdrawMethodName = METHODS.find((m) => m.id === withdrawMethod)?.name ?? "";

  const depositValid = depositAmt !== "" && Number(depositAmt) >= 100 && depositTrxId.trim() !== "" && depositAccounts.length > 0;
  const withdrawValid = withdrawAmt !== "" && Number(withdrawAmt) >= 100 && withdrawAccountNumber.trim() !== "";

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 flex items-center gap-2 text-xs text-[#9B8EC4]">
            <Link href="/" className="transition-colors hover:text-[#F5C842]">{t.profileHome}</Link>
            <span className="text-[#4A3870]">›</span>
            <span className="text-[#C9B8E8]">{t.depositWithdrawTitle}</span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl p-1.5" style={CARD}>
            <button
              onClick={() => setPageTab("deposit")}
              className="rounded-xl py-3 text-sm font-bold transition-all"
              style={pageTab === "deposit"
                ? { background: "rgba(212,175,55,.12)", border: "1px solid rgba(212,175,55,.3)", color: "#F5C842" }
                : { color: "#9B8EC4" }}
            >
              {t.deposit}
            </button>
            <button
              onClick={() => setPageTab("withdraw")}
              className="rounded-xl py-3 text-sm font-bold transition-all"
              style={pageTab === "withdraw"
                ? { background: "rgba(212,175,55,.12)", border: "1px solid rgba(212,175,55,.3)", color: "#F5C842" }
                : { color: "#9B8EC4" }}
            >
              {t.profileTabWithdraw}
            </button>
          </div>

          {pageTab === "deposit" && (
            <div className="rounded-2xl p-6" style={CARD}>
              {depositSubmitted ? (
                <SuccessPanel
                  title={t.profileRequestSubmittedTitle}
                  desc={fmt(t.profileRequestSubmittedDesc, { amount: Number(depositAmt || 0).toLocaleString() })}
                  onDone={() => { setDepositSubmitted(false); setDepositAmt(""); setDepositTrxId(""); }}
                  t={t}
                />
              ) : (
                <>
                  <h3 className="mb-5 text-lg font-extrabold text-white">{t.profileMakeDeposit}</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profilePaymentMethod}</p>
                  <MethodGrid method={depositMethod} onSelect={setDepositMethod} />

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileSendMoneyTo}</p>
                  {accountsLoading ? (
                    <div className="mb-6 h-16 animate-pulse rounded-xl" style={INNER} />
                  ) : accountsError ? (
                    <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
                      <p className="text-xs text-red-300">{t.profileErrGeneric}</p>
                      <button onClick={() => setAccountsRetryKey((k) => k + 1)} className="shrink-0 text-xs font-bold text-[#F5C842]">
                        {t.profileTryAgain}
                      </button>
                    </div>
                  ) : depositAccounts.length === 0 ? (
                    <p className="mb-6 rounded-xl px-4 py-3 text-xs text-[#9B8EC4]" style={INNER}>
                      {fmt(t.noActiveAccountsForMethod, { method: depositMethodName })}
                    </p>
                  ) : (
                    <div className="mb-6 flex flex-col gap-2">
                      {depositAccounts.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-xl px-4 py-3" style={INNER}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] text-[#9B8EC4]">{a.label}</p>
                            <p className="truncate font-mono text-lg font-bold text-[#F5C842]">{a.accountNumber}</p>
                            {a.accountName && <p className="truncate text-[11px] text-[#9B8EC4]">{a.accountName}</p>}
                            {a.details && <p className="truncate text-[11px] text-[#7B5EA7]">{a.details}</p>}
                          </div>
                          <button
                            onClick={() => copyText(a.accountNumber, a.id)}
                            className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-[#0A0612] transition-all hover:scale-105"
                            style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
                          >
                            {copiedAccountId === a.id ? t.profileCopied : t.profileCopy}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <AmountPicker amount={depositAmt} onSelect={setDepositAmt} onCustom={setDepositAmt} t={t} />

                  {depositAmt !== "" && Number(depositAmt) >= 100 && depositAccounts.length > 0 && (
                    <>
                      <p className="mb-2 text-xs leading-relaxed text-[#9B8EC4]">
                        {fmt(t.profileSendInstructions, { amount: Number(depositAmt).toLocaleString(), method: depositMethodName })}
                      </p>
                      <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.profileTrxIdLabel}</label>
                      <input
                        value={depositTrxId}
                        onChange={(e) => setDepositTrxId(e.target.value)}
                        placeholder={t.profileTrxIdPlaceholder}
                        className="mb-5 w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]"
                      />
                    </>
                  )}

                  <button
                    onClick={() => setDepositSubmitted(true)}
                    disabled={!depositValid}
                    className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
                  >
                    {t.profileConfirmDeposit}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[#7B5EA7]">{t.profileDepositFootnote}</p>
                </>
              )}
            </div>
          )}

          {pageTab === "withdraw" && (
            <div className="rounded-2xl p-6" style={CARD}>
              {withdrawSubmitted ? (
                <SuccessPanel
                  title={t.profileWithdrawRequestSubmittedTitle}
                  desc={fmt(t.profileWithdrawRequestSubmittedDesc, { amount: Number(withdrawAmt || 0).toLocaleString() })}
                  onDone={() => { setWithdrawSubmitted(false); setWithdrawAmt(""); setWithdrawAccountNumber(""); }}
                  t={t}
                />
              ) : (
                <>
                  <h3 className="mb-5 text-lg font-extrabold text-white">{t.profileWithdrawFunds}</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileWithdrawMethod}</p>
                  <MethodGrid method={withdrawMethod} onSelect={setWithdrawMethod} />

                  <AmountPicker amount={withdrawAmt} onSelect={setWithdrawAmt} onCustom={setWithdrawAmt} t={t} />

                  <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">
                    {fmt(t.profileWithdrawAccountLabel, { method: withdrawMethodName })}
                  </label>
                  <input
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                    placeholder={t.profileWithdrawAccountPlaceholder}
                    className="mb-6 w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]"
                  />

                  <button
                    onClick={() => setWithdrawSubmitted(true)}
                    disabled={!withdrawValid}
                    className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
                  >
                    {t.profileSubmitWithdrawal}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[#7B5EA7]">{t.profileWithdrawFootnote}</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
