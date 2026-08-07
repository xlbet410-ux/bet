"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { fmt } from "@/lib/format";
import { getActivePaymentAccounts, type PaymentAccount, type PaymentMethod } from "@/lib/paymentAccounts";

type PageTab = "deposit" | "withdraw";

// Each icon file lives at /public/<id>.png — named to match the method id
// exactly, so the image src is just derived from the id below.
const METHODS: { id: PaymentMethod; name: string; nameBn: string; accent: string }[] = [
  { id: "bkash", name: "Bkash", nameBn: "বিকাশ", accent: "#e2136e" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", accent: "#f7941d" },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", accent: "#8c3494" },
  { id: "upay", name: "Upay", nameBn: "উপায়", accent: "#3730a3" },
  { id: "surecash", name: "SureCash", nameBn: "সিওরক্যাশ", accent: "#1d4ed8" },
  { id: "bank", name: "Bank", nameBn: "ব্যাংক", accent: "#0f4c5c" },
  { id: "crypto", name: "Crypto", nameBn: "ক্রিপ্টো", accent: "#f7931a" },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const CARD = { background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(17,17,17,.06)" };
const INNER = { background: "#F9FAFB", border: "1px solid #E5E7EB" };

function Tick({ size = 10, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size }} className={`fill-none stroke-current stroke-2 ${className}`}>
      <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MethodGrid({
  method,
  onSelect,
  lang,
}: {
  method: PaymentMethod;
  onSelect: (id: PaymentMethod) => void;
  lang: string;
}) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {METHODS.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all"
          style={method === m.id
            ? { background: `${m.accent}0D`, border: `1.5px solid ${m.accent}`, color: m.accent }
            : { background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#4B5563" }}
        >
          <span className="relative h-8 w-8 shrink-0">
            <Image src={`/${m.id}.png`} alt={m.name} fill unoptimized sizes="32px" className="object-contain" />
          </span>
          {lang === "bn" ? m.nameBn : m.name}
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
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileQuickAmount}</p>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => onSelect(String(amt))}
            className="rounded-xl py-2.5 text-sm font-bold transition-all"
            style={amount === String(amt)
              ? { background: "rgba(212,175,55,.12)", border: "1px solid #D4AF37", color: "#9A7B1F" }
              : { background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#4B5563" }}
          >
            ৳{amt.toLocaleString()}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileCustomAmount}</p>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
        <input
          type="number"
          min="100"
          value={amount}
          onChange={(e) => onCustom(e.target.value)}
          placeholder={t.profileEnterAmountPlaceholder}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-8 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#D4AF37]"
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
      <h4 className="mb-1 text-lg font-extrabold text-gray-900">{title}</h4>
      <p className="mb-6 text-sm text-gray-500">{desc}</p>
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
  const { t, lang } = useLang();
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
  const depositMethodEntry = METHODS.find((m) => m.id === depositMethod);
  const withdrawMethodEntry = METHODS.find((m) => m.id === withdrawMethod);
  const depositMethodName = (lang === "bn" ? depositMethodEntry?.nameBn : depositMethodEntry?.name) ?? "";
  const withdrawMethodName = (lang === "bn" ? withdrawMethodEntry?.nameBn : withdrawMethodEntry?.name) ?? "";

  const depositValid = depositAmt !== "" && Number(depositAmt) >= 100 && depositTrxId.trim() !== "" && depositAccounts.length > 0;
  const withdrawValid = withdrawAmt !== "" && Number(withdrawAmt) >= 100 && withdrawAccountNumber.trim() !== "";

  return (
    <>
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen bg-white px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="transition-colors hover:text-[#B8892E]">{t.profileHome}</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-600">{t.depositWithdrawTitle}</span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl p-1.5" style={CARD}>
            <button
              onClick={() => setPageTab("deposit")}
              className="rounded-xl py-3 text-sm font-bold transition-all"
              style={pageTab === "deposit"
                ? { background: "rgba(212,175,55,.12)", border: "1px solid #D4AF37", color: "#9A7B1F" }
                : { color: "#6B7280" }}
            >
              {t.deposit}
            </button>
            <button
              onClick={() => setPageTab("withdraw")}
              className="rounded-xl py-3 text-sm font-bold transition-all"
              style={pageTab === "withdraw"
                ? { background: "rgba(212,175,55,.12)", border: "1px solid #D4AF37", color: "#9A7B1F" }
                : { color: "#6B7280" }}
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
                  <h3 className="mb-5 text-lg font-extrabold text-gray-900">{t.profileMakeDeposit}</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profilePaymentMethod}</p>
                  <MethodGrid method={depositMethod} onSelect={setDepositMethod} lang={lang} />

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileSendMoneyTo}</p>
                  {accountsLoading ? (
                    <div className="mb-6 h-16 animate-pulse rounded-xl" style={INNER} />
                  ) : accountsError ? (
                    <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
                      <p className="text-xs text-red-500">{t.profileErrGeneric}</p>
                      <button onClick={() => setAccountsRetryKey((k) => k + 1)} className="shrink-0 text-xs font-bold text-[#B8892E]">
                        {t.profileTryAgain}
                      </button>
                    </div>
                  ) : depositAccounts.length === 0 ? (
                    <p className="mb-6 rounded-xl px-4 py-3 text-xs text-gray-500" style={INNER}>
                      {fmt(t.noActiveAccountsForMethod, { method: depositMethodName })}
                    </p>
                  ) : (
                    <div className="mb-6 flex flex-col gap-2">
                      {depositAccounts.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-xl px-4 py-3" style={INNER}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] text-gray-500">{a.label}</p>
                            <p className="truncate font-mono text-lg font-bold text-[#9A7B1F]">{a.accountNumber}</p>
                            {a.accountName && <p className="truncate text-[11px] text-gray-500">{a.accountName}</p>}
                            {a.details && <p className="truncate text-[11px] text-gray-400">{a.details}</p>}
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
                      <p className="mb-2 text-xs leading-relaxed text-gray-500">
                        {fmt(t.profileSendInstructions, { amount: Number(depositAmt).toLocaleString(), method: depositMethodName })}
                      </p>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600">{t.profileTrxIdLabel}</label>
                      <input
                        value={depositTrxId}
                        onChange={(e) => setDepositTrxId(e.target.value)}
                        placeholder={t.profileTrxIdPlaceholder}
                        className="mb-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#D4AF37]"
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
                  <p className="mt-3 text-center text-[11px] text-gray-400">{t.profileDepositFootnote}</p>
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
                  <h3 className="mb-5 text-lg font-extrabold text-gray-900">{t.profileWithdrawFunds}</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileWithdrawMethod}</p>
                  <MethodGrid method={withdrawMethod} onSelect={setWithdrawMethod} lang={lang} />

                  <AmountPicker amount={withdrawAmt} onSelect={setWithdrawAmt} onCustom={setWithdrawAmt} t={t} />

                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    {fmt(t.profileWithdrawAccountLabel, { method: withdrawMethodName })}
                  </label>
                  <input
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                    placeholder={t.profileWithdrawAccountPlaceholder}
                    className="mb-6 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#D4AF37]"
                  />

                  <button
                    onClick={() => setWithdrawSubmitted(true)}
                    disabled={!withdrawValid}
                    className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
                  >
                    {t.profileSubmitWithdrawal}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-gray-400">{t.profileWithdrawFootnote}</p>
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
