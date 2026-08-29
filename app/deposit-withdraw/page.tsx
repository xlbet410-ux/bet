"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaTrophy } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { fmt } from "@/lib/format";
import { getMyPaymentAccounts, type PaymentAccount, type PaymentMethod } from "@/lib/paymentAccounts";
import { createCashIn, createCashOut } from "@/lib/cashTransactions";
import { getApplicableDepositOffers, type DepositOffer } from "@/lib/offers";
import { getWithdrawable, type WithdrawableInfo } from "@/lib/wallet";
import { getMyKyc, type KycStatus } from "@/lib/kyc";
import { getWithdrawPasswordStatus } from "@/lib/withdrawPassword";

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

function EyeBtn({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-[#B8892E]"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        /* eye-off */
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round"/>
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" strokeLinecap="round"/>
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
        </svg>
      ) : (
        /* eye */
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

type MethodCategoryId = "bank_transfer" | "mobile_banking" | "crypto";

const METHOD_CATEGORIES: { id: MethodCategoryId; labelEn: string; labelBn: string; methods: PaymentMethod[] }[] = [
  { id: "bank_transfer", labelEn: "Bank Transfer", labelBn: "ব্যাংক ট্রান্সফার", methods: ["bank"] },
  { id: "mobile_banking", labelEn: "Mobile Banking", labelBn: "মোবাইল ব্যাংকিং", methods: ["bkash", "nagad", "rocket", "upay", "surecash"] },
  { id: "crypto", labelEn: "Crypto", labelBn: "ক্রিপ্টো", methods: ["crypto"] },
];

function MethodGrid({
  method,
  onSelect,
  lang,
  accounts,
}: {
  method: PaymentMethod;
  onSelect: (id: PaymentMethod) => void;
  lang: string;
  accounts: PaymentAccount[];
}) {
  const [activeCat, setActiveCat] = useState<MethodCategoryId>(
    () => METHOD_CATEGORIES.find((c) => c.methods.includes(method))?.id ?? "mobile_banking"
  );

  const activeMethods = METHOD_CATEGORIES.find((c) => c.id === activeCat)?.methods ?? [];
  const hasActiveAccount = (m: PaymentMethod) => accounts.some((a) => a.method === m);

  return (
    <div className="mb-6">
      <div className="mb-4 grid grid-cols-3 border-b border-[#E5E7EB]">
        {METHOD_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className="relative truncate px-1 py-2.5 text-center text-[11px] font-bold transition-colors sm:text-sm"
            style={{ color: activeCat === c.id ? "#9A7B1F" : "#6B7280" }}
          >
            {lang === "bn" ? c.labelBn : c.labelEn}
            {activeCat === c.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full" style={{ background: "#D4AF37" }} />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {activeMethods.map((mId) => {
          const m = METHODS.find((x) => x.id === mId);
          if (!m) return null;
          const active = hasActiveAccount(mId);
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="relative flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all"
              style={method === m.id
                ? { background: `${m.accent}0D`, border: `1.5px solid ${m.accent}`, color: m.accent }
                : { background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#4B5563" }}
            >
              {active && (
                <span className="absolute -top-2 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                  {lang === "bn" ? "সক্রিয়" : "Active"}
                </span>
              )}
              <span className="relative h-8 w-8 shrink-0">
                <Image src={`/${m.id}.png`} alt={m.name} fill unoptimized sizes="32px" className="object-contain" />
              </span>
              {lang === "bn" ? m.nameBn : m.name}
            </button>
          );
        })}
      </div>
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

function OfferPicker({
  offers,
  loading,
  selectedId,
  onSelect,
  lang,
}: {
  offers: DepositOffer[];
  loading: boolean;
  selectedId: string | null | undefined;
  onSelect: (id: string | null) => void;
  lang: string;
}) {
  const strings =
    lang === "bn"
      ? { heading: "প্রমোশন", noneLabel: "কোনো প্রমোশনে অংশগ্রহণ করবেন না", turnover: "টার্নওভার", validity: "মেয়াদ", days: "দিন", terms: "শর্তাবলী" }
      : { heading: "Promotions", noneLabel: "Do not participate in any promotions", turnover: "TURNOVER", validity: "VALID", days: "days", terms: "TERMS" };

  if (loading || offers.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{strings.heading}</p>
      </div>

      <div className="flex flex-col gap-2">
        {offers.map((o) => {
          const selected = selectedId === o.id;
          const title = (lang === "bn" ? o.titleBn : o.titleEn) || o.titleBn;
          const terms = (lang === "bn" ? o.termsBn : o.termsEn) || o.termsBn;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className="w-full rounded-xl px-4 py-3 text-left transition-all"
              style={
                selected
                  ? { background: "rgba(212,175,55,.08)", border: "1px solid #D4AF37" }
                  : { background: "#F9FAFB", border: "1px solid #E5E7EB" }
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    style={selected ? { borderColor: "#D4AF37" } : { borderColor: "#D1D5DB" }}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />}
                  </span>
                  <span className={`text-sm font-bold ${selected ? "text-[#9A7B1F]" : "text-gray-700"}`}>{title}</span>
                </div>
                <span className="shrink-0 text-xs font-black text-[#D4AF37]">+৳{Number(o.potentialReward).toLocaleString()}</span>
              </div>

              {selected && (
                <div className="mt-2.5 border-t border-[#D4AF37]/20 pt-2.5 text-xs text-gray-500">
                  <p>
                    {strings.turnover}: {o.turnoverMultiplier}x
                    {o.bonusValidityDays ? ` · ${strings.validity}: ${o.bonusValidityDays} ${strings.days}` : ""}
                  </p>
                  {terms && (
                    <p className="mt-1.5 leading-relaxed">
                      <span className="font-semibold text-gray-600">{strings.terms}: </span>
                      {terms}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left transition-all"
          style={
            selectedId === null
              ? { background: "rgba(212,175,55,.08)", border: "1px solid #D4AF37" }
              : { background: "#F9FAFB", border: "1px solid #E5E7EB" }
          }
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
              style={selectedId === null ? { borderColor: "#D4AF37" } : { borderColor: "#D1D5DB" }}
            >
              {selectedId === null && <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />}
            </span>
            <span className={`text-sm font-bold ${selectedId === null ? "text-[#9A7B1F]" : "text-gray-700"}`}>{strings.noneLabel}</span>
          </div>
          <FaTrophy className="shrink-0 text-base text-[#D4AF37]/60" />
        </button>
      </div>
    </div>
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

function AccountStep({
  methodEntry,
  account,
  accountsLoading,
  accountsError,
  onRetryAccounts,
  amount,
  promoLabel,
  trxId,
  onTrxIdChange,
  onBack,
  onConfirm,
  valid,
  submitting,
  submitError,
  lang,
  t,
  copied,
  onCopy,
}: {
  methodEntry: { id: PaymentMethod; name: string; nameBn: string; accent: string } | undefined;
  account: PaymentAccount | undefined;
  accountsLoading: boolean;
  accountsError: boolean;
  onRetryAccounts: () => void;
  amount: string;
  promoLabel: string;
  trxId: string;
  onTrxIdChange: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  valid: boolean;
  submitting: boolean;
  submitError: string | null;
  lang: string;
  t: ReturnType<typeof useLang>["t"];
  copied: boolean;
  onCopy: () => void;
}) {
  const methodName = methodEntry ? (lang === "bn" ? methodEntry.nameBn : methodEntry.name) : "";
  const accent = methodEntry?.accent ?? "#D4AF37";
  const summaryLabels = lang === "bn" ? { amount: "পরিমাণ", promo: "প্রমোশন", none: "কোনোটি নয়", back: "মেথড ও পরিমাণ পরিবর্তন করুন" } : { amount: "Amount", promo: "Promotion", none: "None", back: "Change method or amount" };

  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-[#B8892E]">
        <FaChevronLeft className="text-[10px]" /> {summaryLabels.back}
      </button>

      <div
        className="mb-5 flex items-center gap-3 rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}05)`, border: `1px solid ${accent}33` }}
      >
        {methodEntry && (
          <span className="relative h-10 w-10 shrink-0">
            <Image src={`/${methodEntry.id}.png`} alt={methodName} fill unoptimized sizes="40px" className="object-contain" />
          </span>
        )}
        <div>
          <p className="text-base font-extrabold text-gray-900">{methodName}</p>
          <p className="text-xs text-gray-500">{t.profileMakeDeposit}</p>
        </div>
      </div>

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileSendMoneyTo}</p>
      {accountsLoading ? (
        <div className="mb-5 h-16 animate-pulse rounded-xl" style={INNER} />
      ) : accountsError ? (
        <div className="mb-5 flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
          <p className="text-xs text-red-500">{t.profileErrGeneric}</p>
          <button onClick={onRetryAccounts} className="shrink-0 text-xs font-bold text-[#B8892E]">{t.profileTryAgain}</button>
        </div>
      ) : !account ? (
        <p className="mb-5 rounded-xl px-4 py-3 text-xs text-gray-500" style={INNER}>
          {fmt(t.noActiveAccountsForMethod, { method: methodName })}
        </p>
      ) : (
        <div className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: `${accent}0A`, border: `1px solid ${accent}40` }}>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xl font-black" style={{ color: accent }}>{account.accountNumber}</p>
          </div>
          <button
            onClick={onCopy}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: accent }}
          >
            {copied ? t.profileCopied : t.profileCopy}
          </button>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl px-4 py-3" style={INNER}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{summaryLabels.amount}</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">৳{Number(amount || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl px-4 py-3" style={INNER}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{summaryLabels.promo}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-gray-900">{promoLabel || summaryLabels.none}</p>
        </div>
      </div>

      {account && (
        <p className="mb-2 text-xs leading-relaxed text-gray-500">
          {fmt(t.profileSendInstructions, { amount: Number(amount || 0).toLocaleString(), method: methodName })}
        </p>
      )}
      <label className="mb-1.5 block text-xs font-medium text-gray-600">{t.profileTrxIdLabel}</label>
      <input
        value={trxId}
        onChange={(e) => onTrxIdChange(e.target.value)}
        placeholder={t.profileTrxIdPlaceholder}
        className="mb-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#D4AF37]"
      />

      {submitError && <p className="mb-3 text-center text-xs text-red-500">{submitError}</p>}

      <button
        onClick={onConfirm}
        disabled={!valid || submitting}
        className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
      >
        {submitting ? "..." : t.profileConfirmDeposit}
      </button>
      <p className="mt-3 text-center text-[11px] text-gray-400">{t.profileDepositFootnote}</p>
    </>
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
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>("bkash");
  const [depositAmt, setDepositAmt] = useState("");
  const [depositOffers, setDepositOffers] = useState<DepositOffer[]>([]);
  const [depositOffersLoading, setDepositOffersLoading] = useState(false);
  // Tri-state: undefined = no explicit choice made yet, null = explicitly
  // picked "do not participate in any promotions", string = a chosen
  // offer's id. Distinguishing undefined from null matters — collapsing
  // them both to null (as before) meant the backend couldn't tell "no
  // offers were ever shown" apart from "the player declined", so it kept
  // auto-applying an eligible bonus anyway on an explicit opt-out.
  const [selectedOfferId, setSelectedOfferId] = useState<string | null | undefined>(undefined);
  const [depositTrxId, setDepositTrxId] = useState("");
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositSubmitError, setDepositSubmitError] = useState<string | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [depositAccountIndex, setDepositAccountIndex] = useState(0);

  // withdraw
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>("bkash");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSubmitError, setWithdrawSubmitError] = useState<string | null>(null);
  const [withdrawable, setWithdrawable] = useState<WithdrawableInfo | null>(null);

  // withdraw verification — either a verified KYC or a correct withdrawal
  // password satisfies the backend's gate (see TransactionsService.createCashOut),
  // never both.
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);
  const [kycStatusLoading, setKycStatusLoading] = useState(true);
  const [wpIsSet, setWpIsSet] = useState(false);
  const [wpStatusLoading, setWpStatusLoading] = useState(true);
  const [withdrawPasswordInput, setWithdrawPasswordInput] = useState("");
  const [showWithdrawPwd, setShowWithdrawPwd] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getWithdrawable()
      .then((w) => { if (!cancelled) setWithdrawable(w); })
      .catch(() => {}); // Non-critical — the form still works without this info box.
    return () => { cancelled = true; };
  }, [user, withdrawSubmitted]);

  useEffect(() => {
    if (!user) return;
    getMyKyc()
      .then((s) => setKycStatus(s))
      .catch(() => setKycStatus(null))
      .finally(() => setKycStatusLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    getWithdrawPasswordStatus()
      .then((s) => setWpIsSet(s.isSet))
      .catch(() => setWpIsSet(false))
      .finally(() => setWpStatusLoading(false));
  }, [user?.id]);

  useEffect(() => {
    function applyTabFromUrl() {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      if (fromUrl === "deposit" || fromUrl === "withdraw") setPageTab(fromUrl);
    }
    applyTabFromUrl();
  }, []);

  // The payment-accounts list rarely changes and this page can't function
  // without it, so retry a few times with backoff before giving up —
  // matches the pattern used for the game catalog on a cold backend. Uses
  // the authenticated /mine endpoint so a player referred by a
  // commission-type agent sees that agent's own number, never shown to
  // anyone else — this page already redirects guests to "/" above, so a
  // logged-in user is guaranteed by the time this fires.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setAccountsLoading(true);
      setAccountsError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getMyPaymentAccounts();
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
  }, [accountsRetryKey, user]);

  // A player referred by an agent always sees that agent's own account for
  // the method, never shuffled in with anyone else's — isMyAgent comes
  // straight from getMyPaymentAccounts and is only ever true for accounts
  // belonging to this player's own referring agent. Only when there's no
  // such account (not referred, or their agent has no number for this
  // method) do we fall back to a random pick among the shared pool, so
  // deposit volume spreads across agents instead of concentrating on
  // whichever account happens to be first. Re-rolls only when the method or
  // the account list itself changes, so it stays put (matching what's
  // already been copied/submitted) while the player is mid-transaction.
  useEffect(() => {
    const matches = accounts.filter((a) => a.method === depositMethod);
    if (matches.length === 0) return;
    const myAgentIndex = matches.findIndex((a) => a.isMyAgent);
    const index = myAgentIndex !== -1 ? myAgentIndex : Math.floor(Math.random() * matches.length);
    Promise.resolve().then(() => setDepositAccountIndex(index));
  }, [accounts, depositMethod]);

  // Fetches the offers this player could pick for the entered amount —
  // re-fetches whenever it crosses the ৳100 minimum or changes to a new
  // valid value; clears out below that so nothing stale lingers.
  useEffect(() => {
    const amount = Number(depositAmt);
    if (!depositAmt || Number.isNaN(amount) || amount < 100) {
      Promise.resolve().then(() => {
        setDepositOffers([]);
        setSelectedOfferId(undefined);
      });
      return;
    }

    let cancelled = false;
    Promise.resolve().then(() => setDepositOffersLoading(true));
    getApplicableDepositOffers(amount)
      .then((offers) => {
        if (cancelled) return;
        setDepositOffers(offers);
        setDepositOffersLoading(false);
        // An explicit "don't participate" (null) carries over across an
        // amount change; a real offer pick only carries over if it's still
        // in the new eligible list; anything else resets to undecided
        // rather than silently reinterpreting "undecided" as "declined".
        setSelectedOfferId((prev) =>
          prev === null ? null : prev && offers.some((o) => o.id === prev) ? prev : undefined,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setDepositOffers([]);
        setDepositOffersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [depositAmt]);

  if (!user) return null;

  function copyText(value: string, id: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedAccountId(id);
      setTimeout(() => setCopiedAccountId((cur) => (cur === id ? null : cur)), 2000);
    });
  }

  async function handleDepositConfirm() {
    setDepositSubmitting(true);
    setDepositSubmitError(null);
    try {
      await createCashIn({
        method: depositMethod,
        amount: Number(depositAmt),
        reference: depositTrxId.trim(),
        paymentAccountId: depositAccount?.id,
        offerId: selectedOfferId ?? undefined,
        noOffer: selectedOfferId === null,
      });
      setDepositSubmitted(true);
    } catch (err) {
      setDepositSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDepositSubmitting(false);
    }
  }

  async function handleWithdrawSubmit() {
    setWithdrawSubmitting(true);
    setWithdrawSubmitError(null);
    try {
      await createCashOut({
        method: withdrawMethod,
        amount: Number(withdrawAmt),
        reference: withdrawAccountNumber.trim(),
        withdrawPassword: isKycVerified ? undefined : withdrawPasswordInput,
      });
      setWithdrawSubmitted(true);
      setWithdrawPasswordInput("");
    } catch (err) {
      setWithdrawSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setWithdrawSubmitting(false);
    }
  }

  const depositAccounts = accounts.filter((a) => a.method === depositMethod);
  const depositAccount = depositAccounts[depositAccountIndex];
  const depositMethodEntry = METHODS.find((m) => m.id === depositMethod);
  const withdrawMethodEntry = METHODS.find((m) => m.id === withdrawMethod);
  const depositMethodName = (lang === "bn" ? depositMethodEntry?.nameBn : depositMethodEntry?.name) ?? "";
  const withdrawMethodName = (lang === "bn" ? withdrawMethodEntry?.nameBn : withdrawMethodEntry?.name) ?? "";
  const selectedOffer = depositOffers.find((o) => o.id === selectedOfferId);
  const depositPromoLabel = selectedOffer
    ? (lang === "bn" ? selectedOffer.titleBn : selectedOffer.titleEn) || selectedOffer.titleBn
    : "";

  const depositStep1Valid = depositAmt !== "" && Number(depositAmt) >= 100 && !accountsLoading && !accountsError && depositAccounts.length > 0;
  const depositValid = depositStep1Valid && depositTrxId.trim() !== "";

  const isKycVerified = kycStatus?.status === "verified";
  // A withdrawal needs EITHER a verified KYC OR a correct withdrawal
  // password — mirrors TransactionsService.createCashOut on the backend.
  const withdrawVerified = isKycVerified || (wpIsSet && withdrawPasswordInput.trim() !== "");
  const withdrawValid =
    withdrawAmt !== "" &&
    Number(withdrawAmt) >= 100 &&
    withdrawAccountNumber.trim() !== "" &&
    !kycStatusLoading &&
    !wpStatusLoading &&
    withdrawVerified;

  return (
    <>
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen bg-white px-4 pb-20 pt-35 sm:px-5 lg:pt-28">
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
                  onDone={() => {
                    setDepositSubmitted(false);
                    setDepositAmt("");
                    setDepositTrxId("");
                    setDepositSubmitError(null);
                    setSelectedOfferId(undefined);
                    setDepositStep(1);
                  }}
                  t={t}
                />
              ) : depositStep === 2 ? (
                <AccountStep
                  methodEntry={depositMethodEntry}
                  account={depositAccount}
                  accountsLoading={accountsLoading}
                  accountsError={accountsError}
                  onRetryAccounts={() => setAccountsRetryKey((k) => k + 1)}
                  amount={depositAmt}
                  promoLabel={depositPromoLabel}
                  trxId={depositTrxId}
                  onTrxIdChange={setDepositTrxId}
                  onBack={() => {
                    setDepositSubmitError(null);
                    setDepositStep(1);
                  }}
                  onConfirm={handleDepositConfirm}
                  valid={depositValid}
                  submitting={depositSubmitting}
                  submitError={depositSubmitError}
                  lang={lang}
                  t={t}
                  copied={depositAccount ? copiedAccountId === depositAccount.id : false}
                  onCopy={() => depositAccount && copyText(depositAccount.accountNumber, depositAccount.id)}
                />
              ) : (
                <>
                  <h3 className="mb-5 text-lg font-extrabold text-gray-900">{t.profileMakeDeposit}</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profilePaymentMethod}</p>
                  <MethodGrid method={depositMethod} onSelect={setDepositMethod} lang={lang} accounts={accounts} />

                  <AmountPicker amount={depositAmt} onSelect={setDepositAmt} onCustom={setDepositAmt} t={t} />

                  <OfferPicker
                    offers={depositOffers}
                    loading={depositOffersLoading}
                    selectedId={selectedOfferId}
                    onSelect={setSelectedOfferId}
                    lang={lang}
                  />

                  {!accountsLoading && !accountsError && depositAccounts.length === 0 && (
                    <p className="mb-5 rounded-xl px-4 py-3 text-xs text-gray-500" style={INNER}>
                      {fmt(t.noActiveAccountsForMethod, { method: depositMethodName })}
                    </p>
                  )}

                  <button
                    onClick={() => setDepositStep(2)}
                    disabled={!depositStep1Valid}
                    className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
                  >
                    {lang === "bn" ? "ঠিক আছে" : "OK"}
                  </button>
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
                  onDone={() => {
                    setWithdrawSubmitted(false);
                    setWithdrawAmt("");
                    setWithdrawAccountNumber("");
                    setWithdrawSubmitError(null);
                  }}
                  t={t}
                />
              ) : (
                <>
                  <h3 className="mb-5 text-lg font-extrabold text-gray-900">{t.profileWithdrawFunds}</h3>

                  {withdrawable && withdrawable.pendingBonuses.length > 0 && (
                    <div className="mb-5 rounded-xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                      <p className="mb-1 text-xs font-bold text-[#92400E]">
                        {lang === "bn"
                          ? `৳${Number(withdrawable.maxWithdrawable).toLocaleString()} এখন উত্তোলনযোগ্য`
                          : `৳${Number(withdrawable.maxWithdrawable).toLocaleString()} available to withdraw now`}
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#B45309]">
                        {lang === "bn"
                          ? "সক্রিয় বোনাসের বাকি টার্নওভার সম্পন্ন না হওয়া পর্যন্ত বাকি অংশ আটকে থাকবে।"
                          : "The rest is locked until your active bonus finishes its turnover requirement."}
                      </p>
                      <Link href="/my-bonuses" className="mt-1.5 inline-block text-[11px] font-bold text-[#B8892E] underline underline-offset-2">
                        {lang === "bn" ? "বোনাস দেখুন" : "View bonuses"}
                      </Link>
                    </div>
                  )}

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileWithdrawMethod}</p>
                  <MethodGrid method={withdrawMethod} onSelect={setWithdrawMethod} lang={lang} accounts={accounts} />

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

                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t.profileWithdrawVerifyTitle}</p>
                  {!kycStatusLoading && !wpStatusLoading && (
                    isKycVerified ? (
                      <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.3)" }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: "#22c55e" }}>
                          <Tick size={9} />
                        </span>
                        <p className="text-xs font-semibold text-green-700">{t.profileWithdrawVerifyKycLabel}</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        {wpIsSet ? (
                          <>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">{t.profileWithdrawVerifyPasswordLabel}</label>
                            <div className="relative">
                              <input
                                type={showWithdrawPwd ? "text" : "password"}
                                value={withdrawPasswordInput}
                                onChange={(e) => setWithdrawPasswordInput(e.target.value)}
                                placeholder={t.profileWithdrawVerifyPasswordPlaceholder}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#D4AF37]"
                              />
                              <EyeBtn visible={showWithdrawPwd} onToggle={() => setShowWithdrawPwd((v) => !v)} />
                            </div>
                          </>
                        ) : (
                          <p className="rounded-xl px-4 py-3 text-xs text-gray-500" style={INNER}>
                            {t.profileWithdrawVerifyNotSet}{" "}
                            <Link href="/profile?tab=settings" className="font-bold text-[#B8892E] underline underline-offset-2">
                              {t.profileWithdrawVerifyNotSetLink}
                            </Link>
                          </p>
                        )}
                      </div>
                    )
                  )}

                  {withdrawSubmitError && (
                    <p className="mb-3 text-center text-xs text-red-500">
                      {withdrawSubmitError}
                      {withdrawSubmitError.toLowerCase().includes("bonus") && (
                        <>
                          {" "}
                          <Link href="/my-bonuses" className="font-bold underline underline-offset-2">
                            {lang === "bn" ? "বোনাস দেখুন" : "View bonuses"}
                          </Link>
                        </>
                      )}
                    </p>
                  )}

                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={!withdrawValid || withdrawSubmitting}
                    className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)", boxShadow: "0 0 32px rgba(212,175,55,.35)" }}
                  >
                    {withdrawSubmitting ? "..." : t.profileSubmitWithdrawal}
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
