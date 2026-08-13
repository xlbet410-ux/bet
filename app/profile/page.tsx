"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getMyKyc, submitKyc, type KycStatus } from "@/lib/kyc";
import { sendKycOtp, verifyKycOtp } from "@/lib/otp";
import { getMyCashTransactions, type MyCashTransaction } from "@/lib/cashTransactions";
import { getMyVipStatus, type VipStatus } from "@/lib/vip";
import { getStreakInfo, type StreakInfo } from "@/lib/loginStreak";
import { getMyGameHistory, type MyGameHistoryEntry } from "@/lib/gameHistory";
import { fmt } from "@/lib/format";

const METHOD_LABELS: Record<string, string> = {
  bkash: "Bkash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  surecash: "SureCash",
  bank: "Bank",
  crypto: "Crypto",
};

type TxFilter = "all" | "24h" | "week" | "month";

type Tab     = "profile" | "wallet" | "deposit" | "withdraw" | "history" | "settings" | "kyc";
type KycStep = "idle" | "phone" | "otp" | "docType" | "upload" | "selfie" | "done";

const TABS: Tab[] = ["profile", "wallet", "deposit", "withdraw", "history", "settings", "kyc"];

function DocTypeIcon({ id, className = "" }: { id: string; className?: string }) {
  if (id === "passport") {
    return (
      <svg viewBox="0 0 24 24" className={`h-7 w-7 fill-none stroke-current stroke-[1.5] ${className}`}>
        <rect x="4" y="3" width="16" height="18" rx="2"/>
        <circle cx="12" cy="10" r="3"/>
        <path d="M9 16.5h6" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "license") {
    return (
      <svg viewBox="0 0 24 24" className={`h-7 w-7 fill-none stroke-current stroke-[1.5] ${className}`}>
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="7.5" cy="12" r="1.8"/>
        <path d="M12.5 9.5h6.5M12.5 12h5M12.5 14.5h3.5" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`h-7 w-7 fill-none stroke-current stroke-[1.5] ${className}`}>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <circle cx="8" cy="12" r="2.5"/>
      <path d="M14 9.5h5M14 12h5M14 14.5h3" strokeLinecap="round"/>
    </svg>
  );
}

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
      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-[#8A7DB0] transition-colors hover:text-[#D4AF37]"
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

const CARD  = { background:"linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))", border:"1px solid rgba(255,255,255,.07)", boxShadow:"0 8px 32px rgba(0,0,0,.4)" };
const INNER = { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" };

function formatTxDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "YYYY-MM" in the local timezone — populates the Game History month filter
// from whatever's currently loaded (it grows as the player hits Load More).
function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

// Gradient per VIP group — the backend only stores level/group data, not
// colors, so the visual treatment per group lives here (site's purple/gold
// palette, extended per group tier).
const GROUP_COLORS: Record<string, { from: string; to: string }> = {
  Newcomer: { from: "#6B5B95", to: "#9B8EC4" },
  Bronze: { from: "#8C5A2B", to: "#C98A4B" },
  Silver: { from: "#9CA3AF", to: "#E5E7EB" },
  Gold: { from: "#D4AF37", to: "#F5C842" },
  Platinum: { from: "#7DD3E8", to: "#CFF3FA" },
  Diamond: { from: "#9B30FF", to: "#F5C842" },
};

// Splits a translated string on a single {token} and renders the replacement
// (usually a styled <span>) in place, e.g. a sentence with the document name
// highlighted in white in the middle of it.
function TemplatedText({ template, token, replacement }: { template: string; token: string; replacement: React.ReactNode }) {
  const marker = `{${token}}`;
  const idx = template.indexOf(marker);
  if (idx === -1) return <>{template}</>;
  return (
    <>
      {template.slice(0, idx)}
      {replacement}
      {template.slice(idx + marker.length)}
    </>
  );
}

function ProgressRow({ label, current, target, percent, color }: { label: string; current: string; target: string; percent: number; color: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#9B8EC4]">
        <span>
          {label}: ৳{current} / ৳{target}
        </span>
        <span className="font-bold" style={{ color }}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}

function VipLevelCard({ status, lang }: { status: VipStatus; lang: string }) {
  const strings =
    lang === "bn"
      ? { heading: "আপনার লেভেল", next: "পরবর্তী লেভেল", maxed: "সর্বোচ্চ লেভেলে পৌঁছেছেন", deposit: "জমা", bet: "বাজি", need: "পরবর্তী লেভেলে যেতে প্রয়োজন" }
      : { heading: "Your Level", next: "Next level", maxed: "You've reached the highest level", deposit: "Deposit", bet: "Wagered", need: "Needed for next level" };

  const { current, next, depositProgressPercent, betProgressPercent } = status;
  const colors = GROUP_COLORS[current.groupName] ?? GROUP_COLORS.Bronze;
  const tierName = lang === "bn" ? current.nameBn : current.nameEn;
  const nextName = next ? (lang === "bn" ? next.nameBn : next.nameEn) : null;
  const nextColors = next ? GROUP_COLORS[next.groupName] ?? colors : colors;
  const fmtNum = (v: string) => Math.round(Number(v)).toLocaleString();

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.from}1f, rgba(27,8,56,.65))`,
        border: `1px solid ${colors.from}55`,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-black text-[#0A0612]"
            style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, boxShadow: `0 0 24px ${colors.from}55` }}
          >
            {current.level}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{strings.heading}</p>
            <p className="text-base font-extrabold text-white">
              VIP {current.level} · {tierName}
            </p>
          </div>
        </div>

        {next ? (
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{strings.next}</p>
            <p className="text-sm font-bold text-[#C9B8E8]">
              VIP {next.level} · {nextName}
            </p>
          </div>
        ) : (
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0A0612]"
            style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
          >
            {strings.maxed}
          </span>
        )}
      </div>

      {next && (
        <>
          <ProgressRow
            label={strings.deposit}
            current={fmtNum(status.lifetimeDepositAmount)}
            target={fmtNum(next.requiredDeposit)}
            percent={depositProgressPercent}
            color={nextColors.from}
          />
          <ProgressRow
            label={strings.bet}
            current={fmtNum(status.lifetimeBetAmount)}
            target={fmtNum(next.requiredBet)}
            percent={betProgressPercent}
            color={nextColors.to}
          />
        </>
      )}

      <Link href="/vip" className="mt-3 inline-block text-[11px] font-semibold text-[#F5C842] transition-colors hover:text-[#D4AF37]">
        {lang === "bn" ? "সব লেভেল দেখুন →" : "View all levels →"}
      </Link>
    </div>
  );
}

function StreakCard({ streak, lang }: { streak: StreakInfo; lang: string }) {
  const strings = lang === "bn"
    ? { heading: "লগইন স্ট্রিক", days: "দিন", longest: "সর্বোচ্চ", next: "পরবর্তী মাইলস্টোন" }
    : { heading: "Login Streak", days: "days", longest: "Longest", next: "Next milestone" };

  return (
    <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg,rgba(212,175,55,.12),rgba(27,8,56,.65))", border: "1px solid rgba(212,175,55,.35)", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{strings.heading}</p>
          <p className="text-2xl font-black text-[#F5C842]">
            🔥 {streak.currentStreak} <span className="text-sm font-bold text-white">{strings.days}</span>
          </p>
        </div>
        <div className="text-right text-xs text-[#9B8EC4]">
          <p>{strings.longest}: <span className="font-bold text-white">{streak.longestStreak}</span></p>
          {streak.nextMilestone && (
            <p className="mt-1">{strings.next}: <span className="font-bold text-white">{streak.nextMilestone}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, changePassword } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();

  const docTypes = [
    { id: "nid", label: t.profileDocTypeLabels[0] },
    { id: "passport", label: t.profileDocTypeLabels[1] },
    { id: "license", label: t.profileDocTypeLabels[2] },
  ];
  const kycStepsLabels = t.profileKycStepLabels;

  const [authMode, setAuthMode]       = useState<"login"|"register"|null>(null);
  const [tab, setTab]                 = useState<Tab>("profile");

  // reads ?tab= on mount only — window isn't available during prerendering,
  // and using useSearchParams() here would force a Suspense boundary around
  // the whole page (this component isn't wrapped in one). Deposit/withdraw
  // moved to their own page — redirect any stale links/bookmarks there.
  useEffect(() => {
    function applyTabFromUrl() {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      if (fromUrl === "deposit" || fromUrl === "withdraw") {
        router.replace(`/deposit-withdraw?tab=${fromUrl}`);
        return;
      }
      if (TABS.includes(fromUrl as Tab)) setTab(fromUrl as Tab);
    }
    applyTabFromUrl();
  }, [router]);

  // settings — update password
  const [oldPassword, setOldPassword]   = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [pwdError, setPwdError]         = useState("");
  const [pwdSuccess, setPwdSuccess]     = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [showOldPwd, setShowOldPwd]       = useState(false);
  const [showNewPwd, setShowNewPwd]       = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // settings — share & earn
  const [codeCopied, setCodeCopied]   = useState(false);
  const [linkCopied, setLinkCopied]   = useState(false);

  // KYC
  const [kycStatus, setKycStatus]         = useState<KycStatus>(null);
  const [kycStatusLoading, setKycStatusLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycSubmitError, setKycSubmitError] = useState("");
  const [kycStep, setKycStep]         = useState<KycStep>("idle");
  const [kycPhone, setKycPhone]       = useState("");
  const [otpDigits, setOtpDigits]     = useState(["","","","","",""]);
  const [otpSending, setOtpSending]   = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError]       = useState("");
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [docType, setDocType]         = useState("");
  const [docSide, setDocSide]         = useState<"front"|"back">("front");
  const [frontImg, setFrontImg]       = useState<string|null>(null);
  const [backImg, setBackImg]         = useState<string|null>(null);
  const [docReviewReady, setDocReviewReady] = useState(false);
  const [selfieImg, setSelfieImg]     = useState<string|null>(null);
  const [camError, setCamError]       = useState("");
  const [capturing, setCapturing]     = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  // Wallet — deposit/withdraw history
  const [transactions, setTransactions] = useState<MyCashTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(false);
  const [txRetryKey, setTxRetryKey] = useState(0);
  const [txFilter, setTxFilter] = useState<TxFilter>("all");

  // VIP — real, backend-computed level/progress (auto-upgrades on deposit/bet)
  const [vipStatus, setVipStatus] = useState<VipStatus | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);

  // Game history — bet-by-bet, profile "Game History" tab
  const [gameHistory, setGameHistory] = useState<MyGameHistoryEntry[]>([]);
  const [gameHistoryTotal, setGameHistoryTotal] = useState(0);
  const [gameHistoryPage, setGameHistoryPage] = useState(1);
  const [gameHistoryLoading, setGameHistoryLoading] = useState(true);
  const [gameHistoryLoadingMore, setGameHistoryLoadingMore] = useState(false);
  const [gameHistoryError, setGameHistoryError] = useState(false);
  const [gameHistoryRetryKey, setGameHistoryRetryKey] = useState(0);
  const [gameHistoryMonth, setGameHistoryMonth] = useState<string>("all");
  const GAME_HISTORY_PAGE_SIZE = 30;

  useEffect(() => { if (!authLoading && !user) router.replace("/"); }, [authLoading, user, router]);

  // Same retry-with-backoff pattern used for wallet transactions/KYC on this page.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const status = await getMyVipStatus();
          if (!cancelled) setVipStatus(status);
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    getMyKyc()
      .then((s) => setKycStatus(s))
      .catch(() => setKycStatus(null))
      .finally(() => setKycStatusLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    getStreakInfo()
      .then((s) => setStreakInfo(s))
      .catch(() => {}); // Non-critical — just a small display card.
  }, [user?.id]);

  // Same retry-with-backoff pattern used for the game catalog and payment
  // accounts elsewhere in this app, for a cold backend right after deploy.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setTxLoading(true);
      setTxError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getMyCashTransactions();
          if (!cancelled) {
            setTransactions(list);
            setTxLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setTxError(true);
        setTxLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Keyed on user?.id, not user itself — a live balance update creates a
    // new user object on every bet/bonus event, and re-running this would
    // flash the transactions list back to its loading skeleton constantly.
  }, [user?.id, txRetryKey]);

  // Same retry-with-backoff pattern used elsewhere on this page — only
  // fetches once the player actually opens the tab, not on every profile visit.
  useEffect(() => {
    if (!user || tab !== "history") return;
    let cancelled = false;

    async function load() {
      setGameHistoryLoading(true);
      setGameHistoryError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await getMyGameHistory(1, GAME_HISTORY_PAGE_SIZE);
          if (!cancelled) {
            setGameHistory(result.games);
            setGameHistoryTotal(result.total);
            setGameHistoryPage(1);
            setGameHistoryLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setGameHistoryError(true);
        setGameHistoryLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Keyed on user?.id, not user itself — a live balance update creates a
    // new user object on every bet/bonus event, and re-running this would
    // flash the game history list back to its loading skeleton constantly.
  }, [user?.id, tab, gameHistoryRetryKey]);

  async function loadMoreGameHistory() {
    setGameHistoryLoadingMore(true);
    try {
      const nextPage = gameHistoryPage + 1;
      const result = await getMyGameHistory(nextPage, GAME_HISTORY_PAGE_SIZE);
      setGameHistory((prev) => [...prev, ...result.games]);
      setGameHistoryTotal(result.total);
      setGameHistoryPage(nextPage);
    } catch {
      // Load More failure is non-critical — the list already shown stays intact.
    } finally {
      setGameHistoryLoadingMore(false);
    }
  }

  const gameHistoryMonths = useMemo(() => {
    const keys = new Set(gameHistory.map((g) => monthKey(g.createdAt)));
    return [...keys].sort().reverse();
  }, [gameHistory]);

  const filteredGameHistory = useMemo(() => {
    if (gameHistoryMonth === "all") return gameHistory;
    return gameHistory.filter((g) => monthKey(g.createdAt) === gameHistoryMonth);
  }, [gameHistory, gameHistoryMonth]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === "all") return transactions;
    const rangeMs =
      txFilter === "24h" ? 24 * 60 * 60 * 1000 : txFilter === "week" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - rangeMs;
    return transactions.filter((tx) => new Date(tx.createdAt).getTime() >= cutoff);
  }, [transactions, txFilter]);

  // start/stop camera when entering a step that needs a live capture:
  // document front/back (upload step) or the selfie step
  useEffect(() => {
    const needsFrontCam  = kycStep === "upload" && docSide === "front" && !frontImg;
    const needsBackCam   = kycStep === "upload" && docSide === "back"  && !backImg;
    const needsSelfieCam = kycStep === "selfie" && !selfieImg;

    if (needsFrontCam || needsBackCam || needsSelfieCam) {
      setCamError("");
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: needsSelfieCam ? "user" : "environment" }, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => setCamError("denied"));
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [kycStep, docSide, frontImg, backImg, selfieImg]);

  if (!user) return null;

  const accountId = `#${user.memberId}`;
  const isKycVerified = kycStatus?.status === "verified";
  const kycStepIdx = ["phone","otp","docType","upload","selfie"].indexOf(kycStep);

  // ── helpers ──────────────────────────────────────────────
  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);
    if (val && idx < 5) (document.getElementById(`otp-${idx+1}`) as HTMLInputElement)?.focus();
  }
  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      (document.getElementById(`otp-${idx-1}`) as HTMLInputElement)?.focus();
  }
  function captureDocument() {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg");
    if (docSide === "front") setFrontImg(dataUrl); else setBackImg(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCapturing(false);
  }
  function retakeDocument(side: "front"|"back") {
    if (side === "front") setFrontImg(null); else setBackImg(null);
    setDocSide(side);
    setDocReviewReady(false);
  }
  function captureSelfie() {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setSelfieImg(c.toDataURL("image/jpeg"));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCapturing(false);
  }
  async function submitVerification() {
    if (!docType || !frontImg || !backImg || !selfieImg) return;
    setKycSubmitting(true);
    setKycSubmitError("");
    try {
      const status = await submitKyc(docType, frontImg, backImg, selfieImg);
      setKycStatus(status);
      resetKycFlow();
    } catch (e) {
      setKycSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setKycSubmitting(false);
    }
  }
  function resetKycFlow() {
    setKycStep("idle");
    setOtpDigits(["","","","","",""]);
    setOtpError(""); setOtpSending(false); setOtpVerifying(false); setOtpResendCooldown(0);
    setDocSide("front");
    setDocReviewReady(false);
    setFrontImg(null); setBackImg(null); setSelfieImg(null);
    setDocType(""); setKycPhone("");
  }

  // Ticks the resend cooldown down to 0 once a second while it's active.
  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const id = setInterval(() => setOtpResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [otpResendCooldown]);

  async function handleSendOtp() {
    if (kycPhone.length < 7 || otpSending) return;
    setOtpError("");
    setOtpSending(true);
    try {
      await sendKycOtp(kycPhone);
      setOtpDigits(["","","","","",""]);
      setOtpResendCooldown(60);
      setKycStep("otp");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : t.profileErrGeneric);
    } finally {
      setOtpSending(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpDigits.every(Boolean) || otpVerifying) return;
    setOtpError("");
    setOtpVerifying(true);
    try {
      await verifyKycOtp(otpDigits.join(""));
      setKycStep("docType");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : t.profileErrGeneric);
    } finally {
      setOtpVerifying(false);
    }
  }

  async function handleChangePassword() {
    setPwdError(""); setPwdSuccess("");
    if (oldPassword.length === 0) { setPwdError(t.profileErrEnterCurrentPwd); return; }
    if (newPassword.length < 6) { setPwdError(t.profileErrNewPwdLength); return; }
    if (newPassword !== confirmNewPwd) { setPwdError(t.profileErrPwdMismatch); return; }

    setPwdSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setPwdSuccess(t.profilePwdUpdateSuccess);
      setOldPassword(""); setNewPassword(""); setConfirmNewPwd("");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : t.profileErrGeneric);
    } finally {
      setPwdSubmitting(false);
    }
  }

  function copyText(value: string, onDone: (v: boolean) => void) {
    navigator.clipboard.writeText(value).then(() => {
      onDone(true);
      setTimeout(() => onDone(false), 2000);
    });
  }

  // ── tabs ─────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"profile", label:t.profileTabProfile, icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg> },
    { id:"wallet",  label:t.profileTabWallet,  icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 4h12a2 2 0 0 0-2-4z"/><circle cx="16" cy="14" r="1.5" className="fill-current stroke-none"/></svg> },
    { id:"deposit", label:t.deposit, icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M12 3v12m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21H4" strokeLinecap="round"/></svg> },
    { id:"withdraw",label:t.profileTabWithdraw,icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M12 21V9m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 3H4" strokeLinecap="round"/></svg> },
    { id:"history", label:t.profileTabHistory, icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:"settings",label:t.profileTabSettings,icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { id:"kyc",     label:t.profileTabKyc,     icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ];

  // Deposit/Withdraw now live on their own page — every other tab still
  // switches locally.
  function handleTabClick(id: Tab) {
    if (id === "deposit" || id === "withdraw") {
      router.push(`/deposit-withdraw?tab=${id}`);
      return;
    }
    setTab(id);
  }

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-6xl">

          {/* breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-[#9B8EC4]">
            <a href="/" className="transition-colors hover:text-[#F5C842]">{t.profileHome}</a>
            <span className="text-[#4A3870]">›</span>
            <span className="text-[#C9B8E8]">{t.myProfile}</span>
          </div>

          {/* ══ MOBILE: compact profile header ══ */}
          <div className="mb-3 flex items-center gap-4 rounded-2xl p-4 lg:hidden" style={CARD}>
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-[#0A0612]"
                style={{ background:"linear-gradient(135deg,#D4AF37,#F5C842)", boxShadow:"0 0 20px #D4AF3740" }}>
                {user.name[0].toUpperCase()}
              </div>
              {isKycVerified && (
                <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ background:"#22c55e", border:"2px solid #0A0612" }}>
                  <Tick size={9} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-white">{user.name}</h2>
                {isKycVerified ? (
                  <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ background:"#22c55e" }}>
                    <Tick size={8} /> {t.profileVerified}
                  </span>
                ) : (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-[#C9B8E8]"
                    style={{ background:"rgba(255,255,255,.08)" }}>
                    {t.profileUnverified}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9B8EC4]">+{user.phone}</p>
              <p className="font-mono text-[10px] text-[#7B5EA7]">{accountId}</p>
            </div>
          </div>

          {/* ══ MOBILE: always-visible tab grid ══ */}
          <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-2xl p-1.5 lg:hidden" style={CARD}>
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => handleTabClick(tb.id)}
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all"
                style={tab === tb.id
                  ? { background:"rgba(212,175,55,.1)", border:"1px solid rgba(212,175,55,.25)" }
                  : {}}>
                <span className={tab === tb.id ? "text-[#F5C842]" : "text-[#9B8EC4]"}>{tb.icon}</span>
                <span className={`text-[10px] font-semibold ${tab === tb.id ? "text-[#F5C842]" : "text-[#9B8EC4]"}`}>
                  {tb.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

            {/* ── Desktop sidebar ───────────────────────────────── */}
            <aside className="hidden w-60 shrink-0 lg:block">
              <div className="rounded-2xl p-5" style={CARD}>
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black text-[#0A0612]"
                      style={{ background:"linear-gradient(135deg,#D4AF37,#F5C842)", boxShadow:"0 0 32px #D4AF3740" }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    {isKycVerified && (
                      <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full text-white"
                        style={{ background:"#22c55e", border:"2.5px solid #0A0612" }}>
                        <Tick size={11} />
                      </div>
                    )}
                  </div>
                  <h2 className="text-base font-extrabold text-white">{user.name}</h2>
                  {isKycVerified ? (
                    <span className="mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ background:"#22c55e" }}>
                      <Tick size={8} /> {t.profileVerified}
                    </span>
                  ) : (
                    <span className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C9B8E8]"
                      style={{ background:"rgba(255,255,255,.08)" }}>
                      {t.profileUnverified}
                    </span>
                  )}
                  <p className="mt-2 font-mono text-[11px] text-[#7B5EA7]">{accountId}</p>
                </div>
                <div className="mb-3 h-px" style={{ background:"rgba(255,255,255,.06)" }} />
                <nav className="flex flex-col gap-1">
                  {tabs.map((tb) => (
                    <button key={tb.id} onClick={() => handleTabClick(tb.id)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all"
                      style={tab === tb.id
                        ? { background:"rgba(212,175,55,.1)", border:"1px solid rgba(212,175,55,.25)", color:"#F5C842" }
                        : { color:"#9B8EC4" }}>
                      {tb.icon}<span>{tb.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* ── Content ───────────────────────────────────────── */}
            <div className="min-w-0 flex-1">

              {/* ════ PROFILE ════ */}
              {tab === "profile" && (
                <div className="flex flex-col gap-4">
                  {vipStatus && <VipLevelCard status={vipStatus} lang={lang} />}
                  {streakInfo && <StreakCard streak={streakInfo} lang={lang} />}

                  <div className="rounded-2xl p-6" style={CARD}>
                    <h3 className="mb-5 text-lg font-extrabold text-white">{t.profileAccountDetails}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label:t.profileLabelFullName,    value:user.name,                    extra:null       },
                        { label:t.profileLabelPhone,        value:`+${user.phone}`,             extra:"verified" },
                        { label:t.profileLabelAccountId,    value:accountId,                    extra:null       },
                        { label:t.profileLabelMemberSince,  value:"July 2026",                  extra:null       },
                        { label:t.profileLabelAccountLevel, value: vipStatus ? `VIP ${vipStatus.current.level} · ${lang === "bn" ? vipStatus.current.nameBn : vipStatus.current.nameEn}` : "—", extra:null },
                        { label:t.profileLabelStatus,       value:t.profileActive,              extra:"active"   },
                      ].map(({ label, value, extra }) => (
                        <div key={label} className="rounded-xl p-4" style={INNER}>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{label}</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{value}</p>
                            {extra === "verified" && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full text-white" style={{ background:"#22c55e" }}>
                                <Tick size={8} />
                              </span>
                            )}
                            {extra === "active" && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{ background:"rgba(34,197,94,.15)", color:"#4ade80", border:"1px solid rgba(34,197,94,.25)" }}>
                                {t.profileActive}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ WALLET ════ */}
              {tab === "wallet" && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-6"
                    style={{ background:"linear-gradient(135deg,#7B2FBE,#4A0E8F)", boxShadow:"0 16px 48px rgba(123,47,190,.35)", border:"1px solid rgba(212,175,55,.2)" }}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-purple-200/60">{t.balance}</p>
                    <p className="text-4xl font-black text-white">{user.balance}</p>
                    <p className="mt-1 text-sm text-purple-200/50">{t.profileAvailableToPlay}</p>
                  </div>
                  <div className="rounded-2xl p-5" style={CARD}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-extrabold text-white">{t.profileRecentTransactions}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(["all", "24h", "week", "month"] as TxFilter[]).map((f) => (
                          <button
                            key={f}
                            onClick={() => setTxFilter(f)}
                            className="rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                            style={
                              txFilter === f
                                ? { background: "rgba(212,175,55,.15)", border: "1px solid #D4AF37", color: "#F5C842" }
                                : { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", color: "#9B8EC4" }
                            }
                          >
                            {f === "all"
                              ? t.profileTxFilterAll
                              : f === "24h"
                                ? t.profileTxFilter24h
                                : f === "week"
                                  ? t.profileTxFilterWeek
                                  : t.profileTxFilterMonth}
                          </button>
                        ))}
                      </div>
                    </div>

                    {txLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-16 animate-pulse rounded-xl" style={INNER} />
                        ))}
                      </div>
                    ) : txError ? (
                      <div className="flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
                        <p className="text-xs text-red-400">{t.profileErrGeneric}</p>
                        <button onClick={() => setTxRetryKey((k) => k + 1)} className="shrink-0 text-xs font-bold text-[#F5C842]">
                          {t.profileTryAgain}
                        </button>
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <p className="py-6 text-center text-sm text-[#7B5EA7]">{t.profileTxEmpty}</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredTransactions.map((tx) => {
                          const isOut = tx.type === "cash_out";
                          const methodLabel = METHOD_LABELS[tx.method] ?? tx.method;
                          const statusStyle =
                            tx.status === "completed"
                              ? { background: "rgba(34,197,94,.1)", color: "#4ade80" }
                              : tx.status === "failed"
                                ? { background: "rgba(239,68,68,.1)", color: "#f87171" }
                                : { background: "rgba(234,179,8,.1)", color: "#facc15" };
                          const statusLabel =
                            tx.status === "completed" ? t.profileStatusCompleted : tx.status === "failed" ? t.profileStatusFailed : t.profileStatusPending;
                          return (
                            <div key={tx.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-white/3" style={INNER}>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                  style={{ background: isOut ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)" }}>
                                  {isOut
                                    ? <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-red-400 stroke-2"><path d="M12 21V9m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 3H4" strokeLinecap="round"/></svg>
                                    : <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-green-400 stroke-2"><path d="M12 3v12m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21H4" strokeLinecap="round"/></svg>
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white">
                                    {methodLabel} {isOut ? t.profileTxWithdraw : t.profileTxDeposit}
                                  </p>
                                  <p className="truncate text-[11px] text-[#9B8EC4]">
                                    {tx.reference ?? tx.id} · {formatTxDate(tx.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className={`font-bold tabular-nums ${isOut ? "text-red-400" : "text-green-400"}`}>
                                  {isOut ? "-" : "+"}৳{tx.amount.toLocaleString()}
                                </p>
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={statusStyle}>
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ════ GAME HISTORY ════ */}
              {tab === "history" && (
                <div className="rounded-2xl p-5" style={CARD}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-extrabold text-white">{t.profileGameHistoryTitle}</h3>
                    {gameHistoryMonths.length > 1 && (
                      <select
                        value={gameHistoryMonth}
                        onChange={(e) => setGameHistoryMonth(e.target.value)}
                        className="rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-3 py-1.5 text-xs font-semibold text-[#C9B8E8] outline-none transition-colors focus:border-[#D4AF37]"
                      >
                        <option value="all" className="bg-[#1B0838]">{t.profileGameHistoryAllMonths}</option>
                        {gameHistoryMonths.map((m) => (
                          <option key={m} value={m} className="bg-[#1B0838]">
                            {monthLabel(m)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {gameHistoryLoading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl" style={INNER} />
                      ))}
                    </div>
                  ) : gameHistoryError ? (
                    <div className="flex items-center justify-between rounded-xl px-4 py-3" style={INNER}>
                      <p className="text-xs text-red-400">{t.profileErrGeneric}</p>
                      <button onClick={() => setGameHistoryRetryKey((k) => k + 1)} className="shrink-0 text-xs font-bold text-[#F5C842]">
                        {t.profileTryAgain}
                      </button>
                    </div>
                  ) : gameHistory.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[#7B5EA7]">{t.profileGameHistoryEmpty}</p>
                  ) : filteredGameHistory.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[#7B5EA7]">{t.profileGameHistoryEmptyMonth}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {filteredGameHistory.map((g) => {
                          const net = Number(g.net);
                          const isWin = net > 0;
                          return (
                            <div
                              key={g.id}
                              className="rounded-xl p-3.5 transition-all hover:scale-[1.01]"
                              style={{ ...INNER, boxShadow: isWin ? "0 0 0 1px rgba(34,197,94,.15)" : undefined }}
                            >
                              <div className="mb-3 flex items-center gap-2.5">
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                                  style={{ background: "linear-gradient(135deg,#7B2FBE55,#D4AF3755)", boxShadow: "0 0 16px #7B2FBE30" }}
                                >
                                  🎮
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-white" title={g.gameName}>
                                    {g.gameName}
                                  </p>
                                  <p className="text-[10px] text-[#7B5EA7]">{formatTxDate(g.createdAt)}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 text-center">
                                <div className="rounded-lg bg-black/20 py-1.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7B5EA7]">{t.profileGameHistoryBet}</p>
                                  <p className="tabular-nums text-xs font-bold text-white">৳{Number(g.betAmount).toLocaleString()}</p>
                                </div>
                                <div className="rounded-lg bg-black/20 py-1.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7B5EA7]">{t.profileGameHistoryWin}</p>
                                  <p className="tabular-nums text-xs font-bold text-white">৳{Number(g.winAmount).toLocaleString()}</p>
                                </div>
                                <div className={`rounded-lg py-1.5 ${isWin ? "bg-green-500/15" : "bg-red-500/10"}`}>
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7B5EA7]">{t.profileGameHistoryNet}</p>
                                  <p className={`tabular-nums text-xs font-bold ${isWin ? "text-green-400" : "text-red-400"}`}>
                                    {net >= 0 ? "+" : ""}৳{net.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {gameHistory.length < gameHistoryTotal && (
                        <button
                          onClick={loadMoreGameHistory}
                          disabled={gameHistoryLoadingMore}
                          className="mt-4 w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 py-2.5 text-xs font-bold text-[#C9B8E8] transition-all hover:bg-white/[.07] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {gameHistoryLoadingMore ? "…" : t.profileGameHistoryLoadMore}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ════ SETTINGS ════ */}
              {tab === "settings" && (
                <div className="space-y-4">

                  {/* Update Password */}
                  <div className="rounded-2xl p-6" style={CARD}>
                    <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileUpdatePasswordTitle}</h3>
                    <p className="mb-5 text-sm text-[#9B8EC4]">{t.profileUpdatePasswordDesc}</p>

                    <div className="mx-auto max-w-sm space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.profileCurrentPasswordLabel}</label>
                        <div className="relative">
                          <input type={showOldPwd ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                            placeholder={t.profileCurrentPasswordPlaceholder}
                            className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 pr-11 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]" />
                          <EyeBtn visible={showOldPwd} onToggle={() => setShowOldPwd((v) => !v)} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.profileNewPasswordLabel}</label>
                        <div className="relative">
                          <input type={showNewPwd ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t.profileNewPasswordPlaceholder}
                            className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 pr-11 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]" />
                          <EyeBtn visible={showNewPwd} onToggle={() => setShowNewPwd((v) => !v)} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.profileConfirmPasswordLabel}</label>
                        <div className="relative">
                          <input type={showConfirmPwd ? "text" : "password"} value={confirmNewPwd} onChange={(e) => setConfirmNewPwd(e.target.value)}
                            placeholder={t.profileConfirmPasswordPlaceholder}
                            className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 pr-11 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]" />
                          <EyeBtn visible={showConfirmPwd} onToggle={() => setShowConfirmPwd((v) => !v)} />
                        </div>
                      </div>

                      {pwdError && (
                        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{pwdError}</p>
                      )}
                      {pwdSuccess && (
                        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">{pwdSuccess}</p>
                      )}

                      <button onClick={handleChangePassword} disabled={pwdSubmitting}
                        className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                        {pwdSubmitting ? t.profileUpdatingBtn : t.profileUpdatePasswordBtn}
                      </button>
                    </div>
                  </div>

                  {/* Share & Earn */}
                  <div className="rounded-2xl p-6" style={CARD}>
                    <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileShareEarnTitle}</h3>
                    <p className="mb-5 text-sm text-[#9B8EC4]">{t.profileShareEarnDesc}</p>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileReferralCodeLabel}</p>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex-1 rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-widest text-[#F5C842]" style={INNER}>
                        {user.referralCode ?? "—"}
                      </div>
                      <button onClick={() => user.referralCode && copyText(user.referralCode, setCodeCopied)}
                        disabled={!user.referralCode}
                        className="shrink-0 rounded-xl px-4 py-3 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                        {codeCopied ? t.profileCopied : t.profileCopy}
                      </button>
                    </div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">{t.profileReferralLinkLabel}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 truncate rounded-xl px-4 py-3 text-sm text-[#C9B8E8]" style={INNER}>
                        {typeof window !== "undefined" ? `${window.location.origin}/?ref=${user.referralCode ?? ""}` : ""}
                      </div>
                      <button
                        onClick={() => user.referralCode && copyText(`${window.location.origin}/?ref=${user.referralCode}`, setLinkCopied)}
                        disabled={!user.referralCode}
                        className="shrink-0 rounded-xl border border-[#7B2FBE]/40 bg-white/4 px-4 py-3 text-sm font-semibold text-[#C9B8E8] transition-all hover:bg-white/[.07] disabled:cursor-not-allowed disabled:opacity-40">
                        {linkCopied ? t.profileCopied : t.profileCopyLink}
                      </button>
                    </div>

                    <Link href="/referral" className="mt-4 inline-block text-[11px] font-semibold text-[#F5C842] transition-colors hover:text-[#D4AF37]">
                      {lang === "bn" ? "আপনার রেফারেল ও আয় দেখুন →" : "View your referrals & earnings →"}
                    </Link>
                  </div>

                </div>
              )}

              {/* ════ KYC ════ */}
              {tab === "kyc" && (
                <div className="space-y-4">

                  {/* ── Loading current status ── */}
                  {kycStatusLoading ? (
                    <div className="rounded-2xl p-10 text-center" style={CARD}>
                      <p className="text-sm text-[#7B5EA7]">{t.profileKycLoading}</p>
                    </div>
                  ) : kycStatus?.status === "verified" ? (
                    /* ── Verified ── */
                    <div className="rounded-2xl p-10 text-center" style={CARD}>
                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                        style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", boxShadow:"0 0 40px rgba(34,197,94,.4)" }}>
                        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-white stroke-2">
                          <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-2xl font-extrabold text-white">{t.profileKycVerifiedTitle}</h3>
                      <p className="mb-6 text-[#9B8EC4]">{t.profileKycVerifiedDesc}</p>
                      <div className="mx-auto mb-6 grid max-w-sm grid-cols-2 gap-3">
                        {t.profileKycChecklist.map((s) => (
                          <div key={s} className="flex items-center gap-2 rounded-xl p-3" style={INNER}>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background:"#22c55e" }}>
                              <Tick size={9} />
                            </span>
                            <span className="text-xs font-medium text-[#C9B8E8]">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : kycStatus?.status === "pending" ? (
                    /* ── Pending review ── */
                    <div className="rounded-2xl p-10 text-center" style={CARD}>
                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                        style={{ background:"linear-gradient(135deg,#D4AF37,#F5C842)", boxShadow:"0 0 40px rgba(212,175,55,.35)" }}>
                        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-[#0A0612] stroke-2">
                          <circle cx="12" cy="12" r="9"/>
                          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="mb-2 text-2xl font-extrabold text-white">{t.profileKycPendingTitle}</h3>
                      <p className="mb-1 text-[#9B8EC4]">
                        <TemplatedText
                          template={t.profileKycPendingDesc1}
                          token="doc"
                          replacement={<span className="text-white">{docTypes.find(d=>d.id===kycStatus.documentType)?.label ?? kycStatus.documentType}</span>}
                        />
                      </p>
                      <p className="text-sm text-[#7B5EA7]">{t.profileKycPendingDesc2}</p>
                    </div>
                  ) : kycStatus?.status === "rejected" && kycStep === "idle" ? (
                    /* ── Rejected ── */
                    <div className="rounded-2xl p-10 text-center" style={CARD}>
                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                        style={{ background:"linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow:"0 0 40px rgba(239,68,68,.35)" }}>
                        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-white stroke-2">
                          <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <h3 className="mb-2 text-2xl font-extrabold text-white">{t.profileKycRejectedTitle}</h3>
                      {kycStatus.rejectReason && (
                        <p className="mx-auto mb-6 max-w-sm rounded-xl p-3 text-sm text-red-300"
                          style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)" }}>
                          {kycStatus.rejectReason}
                        </p>
                      )}
                      <button onClick={() => { resetKycFlow(); setKycStep("phone"); }}
                        className="mx-auto block w-full max-w-xs rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                        style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                        {t.profileTryAgain}
                      </button>
                    </div>
                  ) : kycStep === "idle" ? (
                    /* ── Start screen ── */
                    <div className="rounded-2xl p-8 text-center" style={CARD}>
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                        style={{ background:"rgba(123,47,190,.15)", border:"1px solid rgba(123,47,190,.3)" }}>
                        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-[#9B30FF] stroke-2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <h3 className="mb-2 text-xl font-extrabold text-white">{t.profileKycStartTitle}</h3>
                      <p className="mb-2 text-sm text-[#9B8EC4]">{t.profileKycStartDesc}</p>
                      <p className="mb-8 text-xs text-[#7B5EA7]">{t.profileKycStartNote}</p>
                      <div className="mx-auto mb-8 grid max-w-xs grid-cols-1 gap-2 text-left">
                        {t.profileKycStartSteps.map((s,i) => (
                          <div key={s} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={INNER}>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-[#0A0612]"
                              style={{ background:"linear-gradient(135deg,#D4AF37,#F5C842)" }}>{i+1}</span>
                            <span className="text-sm text-[#C9B8E8]">{s}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setKycStep("phone")}
                        className="w-full max-w-xs rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                        style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)", boxShadow:"0 0 32px rgba(212,175,55,.35)" }}>
                        {t.profileKycStartBtn}
                      </button>
                    </div>
                  ) : (
                    /* ── Multi-step flow ── */
                    <div className="rounded-2xl p-6" style={CARD}>

                      {/* progress bar */}
                      <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                          {kycStepsLabels.map((s, i) => {
                            const active  = kycStepIdx === i;
                            const done    = kycStepIdx >  i;
                            return (
                              <div key={s} className="flex flex-1 flex-col items-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all"
                                  style={done
                                    ? { background:"#22c55e", color:"white" }
                                    : active
                                      ? { background:"linear-gradient(135deg,#D4AF37,#F5C842)", color:"#0A0612" }
                                      : { background:"rgba(255,255,255,.07)", color:"#7B5EA7", border:"1px solid rgba(255,255,255,.1)" }}>
                                  {done ? <Tick size={10} /> : i+1}
                                </div>
                                <span className={`text-[10px] font-semibold ${active ? "text-[#F5C842]" : done ? "text-green-400" : "text-[#7B5EA7]"}`}>{s}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="h-1 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,.07)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width:`${((kycStepIdx+1)/5)*100}%`, background:"linear-gradient(to right,#7B2FBE,#D4AF37)" }} />
                        </div>
                      </div>

                      {/* ── Step 1: Phone ── */}
                      {kycStep === "phone" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileKycPhoneTitle}</h3>
                          <p className="mb-6 text-sm text-[#9B8EC4]">{t.profileKycPhoneDesc}</p>
                          <div className="mx-auto max-w-xs">
                            <div className="relative mb-4">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9B8EC4]">+</span>
                              <input type="tel" value={kycPhone} onChange={(e) => setKycPhone(e.target.value.replace(/\D/g,""))}
                                placeholder={t.profileKycPhonePlaceholder}
                                className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 py-3 pl-8 pr-4 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37]" />
                            </div>
                            {otpError && (
                              <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{otpError}</p>
                            )}
                            <button onClick={handleSendOtp}
                              disabled={kycPhone.length < 7 || otpSending}
                              className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                              style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                              {otpSending ? t.profileOtpSending : t.profileSendOtp}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Step 2: OTP ── */}
                      {kycStep === "otp" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileKycOtpTitle}</h3>
                          <p className="mb-1 text-sm text-[#9B8EC4]">{t.profileKycOtpSentTo} <span className="text-white">+{kycPhone}</span></p>
                          <p className="mb-6 text-xs text-[#7B5EA7]">{t.profileKycOtpDemo}</p>
                          <div className="mx-auto mb-6 flex max-w-xs justify-center gap-2">
                            {otpDigits.map((d, i) => (
                              <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                                maxLength={1} value={d}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKey(i, e)}
                                className="h-12 w-10 rounded-xl border text-center text-lg font-black text-white outline-none transition-all"
                                style={d
                                  ? { background:"rgba(212,175,55,.12)", border:"1px solid rgba(212,175,55,.5)", color:"#F5C842" }
                                  : { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)" }} />
                            ))}
                          </div>
                          {otpError && (
                            <p className="mx-auto mb-4 max-w-xs rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{otpError}</p>
                          )}
                          <div className="mx-auto max-w-xs space-y-2">
                            <button onClick={handleVerifyOtp}
                              disabled={!otpDigits.every(Boolean) || otpVerifying}
                              className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                              style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                              {otpVerifying ? t.profileOtpVerifying : t.profileVerifyOtp}
                            </button>
                            <button onClick={handleSendOtp} disabled={otpResendCooldown > 0 || otpSending}
                              className="w-full text-xs text-[#7B5EA7] transition-colors hover:text-[#9B8EC4] disabled:opacity-50">
                              {otpResendCooldown > 0 ? `${t.profileOtpResend} (${otpResendCooldown}s)` : t.profileOtpResend}
                            </button>
                            <button onClick={() => setKycStep("phone")} className="w-full text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors">
                              {t.profileChangePhone}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Step 3: Document type ── */}
                      {kycStep === "docType" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileKycDocTypeTitle}</h3>
                          <p className="mb-6 text-sm text-[#9B8EC4]">{t.profileKycDocTypeDesc}</p>
                          <div className="mx-auto mb-6 grid max-w-sm grid-cols-3 gap-3">
                            {docTypes.map((d) => (
                              <button key={d.id} onClick={() => setDocType(d.id)}
                                className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all"
                                style={docType === d.id
                                  ? { background:"rgba(212,175,55,.12)", border:"1px solid rgba(212,175,55,.5)", boxShadow:"0 0 20px rgba(212,175,55,.15)" }
                                  : { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}>
                                <DocTypeIcon id={d.id} className={docType===d.id?"text-[#F5C842]":"text-[#9B8EC4]"} />
                                <span className={`text-xs font-semibold ${docType===d.id?"text-[#F5C842]":"text-[#9B8EC4]"}`}>{d.label}</span>
                              </button>
                            ))}
                          </div>
                          <button onClick={() => { if (docType) { setDocSide("front"); setKycStep("upload"); } }} disabled={!docType}
                            className="mx-auto block w-full max-w-xs rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                            style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                            {t.profileContinue}
                          </button>
                        </div>
                      )}

                      {/* ── Step 4: Capture front & back ── */}
                      {kycStep === "upload" && (
                        <div className="text-center">
                          {frontImg && backImg && docReviewReady ? (
                            /* ── both sides captured: review screen ── */
                            <>
                              <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileKycReviewTitle}</h3>
                              <p className="mb-6 text-sm text-[#9B8EC4]">
                                <TemplatedText
                                  template={t.profileKycReviewDesc}
                                  token="doc"
                                  replacement={<span className="text-white">{docTypes.find(d=>d.id===docType)?.label}</span>}
                                />
                              </p>
                              <div className="mx-auto mb-6 grid max-w-md grid-cols-2 gap-4">
                                {(["front","back"] as const).map((side) => (
                                  <div key={side} className="flex flex-col gap-2">
                                    <div className="relative overflow-hidden rounded-2xl" style={{ border:"1px solid rgba(34,197,94,.4)" }}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={side === "front" ? frontImg! : backImg!} alt={side} className="aspect-[4/3] w-full object-cover" />
                                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize text-white" style={{ background:"#22c55e" }}>
                                        <Tick size={8} /> {side}
                                      </span>
                                    </div>
                                    <button onClick={() => retakeDocument(side)} className="text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors">
                                      {side === "front" ? t.profileRetakeFront : t.profileRetakeBack}
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button onClick={() => setKycStep("selfie")}
                                className="w-full max-w-xs rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                                style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                {t.profileContinueToSelfie}
                              </button>
                            </>
                          ) : (
                            /* ── active capture: front, then back ── */
                            <>
                              <h3 className="mb-1 text-lg font-extrabold text-white">
                                {docSide === "front" ? t.profileCaptureFrontTitle : t.profileCaptureBackTitle}
                              </h3>
                              <p className="mb-1 text-sm text-[#9B8EC4]">
                                <TemplatedText
                                  template={docSide === "front" ? t.profilePositionFrontDesc : t.profilePositionBackDesc}
                                  token="doc"
                                  replacement={<span className="text-white">{docTypes.find(d=>d.id===docType)?.label}</span>}
                                />
                              </p>
                              <p className="mb-5 text-xs text-[#7B5EA7]">{fmt(t.profileStepXOf2, { n: docSide === "front" ? "1" : "2" })}</p>

                              {camError ? (
                                <div className="mx-auto mb-5 max-w-sm rounded-xl p-4 text-sm text-red-300"
                                  style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)" }}>
                                  {t.profileCamError}
                                </div>
                              ) : (docSide === "front" ? frontImg : backImg) ? (
                                /* captured photo, awaiting confirm/retake */
                                <div className="relative mx-auto mb-5 w-full max-w-sm overflow-hidden rounded-2xl"
                                  style={{ border:"1px solid rgba(34,197,94,.4)" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={(docSide === "front" ? frontImg : backImg)!} alt={docSide} className="aspect-[4/3] w-full object-cover" />
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                    <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background:"#22c55e" }}>
                                      <Tick size={9} /> {t.profileCaptured}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* live camera with document-frame guide */
                                <div className="relative mx-auto mb-5 w-full max-w-sm overflow-hidden rounded-2xl"
                                  style={{ background:"#000", border:"1px solid rgba(123,47,190,.4)", aspectRatio:"4/3" }}>
                                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                                    <div className="h-full w-full rounded-2xl" style={{ border:"2px dashed rgba(212,175,55,.6)", aspectRatio:"1.6/1", maxHeight:"100%" }} />
                                  </div>
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-white/70"
                                    style={{ background:"rgba(0,0,0,.5)" }}>
                                    {t.profileFitDocument}
                                  </div>
                                </div>
                              )}

                              <canvas ref={canvasRef} className="hidden" />

                              <div className="mx-auto flex max-w-sm flex-col gap-2">
                                {(docSide === "front" ? frontImg : backImg) ? (
                                  <>
                                    <button
                                      onClick={() => { if (docSide === "front") setDocSide("back"); else setDocReviewReady(true); }}
                                      className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                                      style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                      {docSide === "front" ? t.profileUseThisPhotoContinue : t.profileUseThisPhoto}
                                    </button>
                                    <button onClick={() => retakeDocument(docSide)} className="text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors">
                                      {t.profileRetakePhoto}
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={captureDocument} disabled={!!camError || capturing}
                                    className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                                    style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#0A0612] stroke-2">
                                      <circle cx="12" cy="13" r="4"/><path d="M9 3h6l2 2h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3z"/>
                                    </svg>
                                    {t.profileCapturePhoto}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* ── Step 5: Selfie ── */}
                      {kycStep === "selfie" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">{t.profileKycSelfieTitle}</h3>
                          <p className="mb-5 text-sm text-[#9B8EC4]">
                            <TemplatedText
                              template={t.profileKycSelfieDesc}
                              token="doc"
                              replacement={<span className="text-white">{docTypes.find(d=>d.id===docType)?.label}</span>}
                            />
                          </p>

                          {camError ? (
                            <div className="mx-auto mb-5 max-w-sm rounded-xl p-4 text-sm text-red-300"
                              style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)" }}>
                              {t.profileCamError}
                            </div>
                          ) : selfieImg ? (
                            /* captured photo */
                            <div className="relative mx-auto mb-5 w-full max-w-xs overflow-hidden rounded-2xl"
                              style={{ border:"1px solid rgba(34,197,94,.4)" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={selfieImg} alt="selfie" className="w-full rounded-2xl" />
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background:"#22c55e" }}>
                                  <Tick size={9} /> {t.profileCaptured}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* live camera */
                            <div className="relative mx-auto mb-5 w-full max-w-xs overflow-hidden rounded-2xl"
                              style={{ background:"#000", border:"1px solid rgba(123,47,190,.4)", aspectRatio:"4/3" }}>
                              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                              {/* face guide overlay */}
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-36 w-28 rounded-full" style={{ border:"2px dashed rgba(212,175,55,.5)" }} />
                              </div>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-white/70"
                                style={{ background:"rgba(0,0,0,.5)" }}>
                                {t.profilePositionFace}
                              </div>
                            </div>
                          )}

                          <canvas ref={canvasRef} className="hidden" />

                          {kycSubmitError && (
                            <div className="mx-auto mb-3 max-w-xs rounded-xl p-3 text-xs text-red-300"
                              style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)" }}>
                              {kycSubmitError}
                            </div>
                          )}

                          <div className="mx-auto flex max-w-xs flex-col gap-2">
                            {selfieImg ? (
                              <>
                                <button onClick={submitVerification} disabled={kycSubmitting}
                                  className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-60"
                                  style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                  {kycSubmitting ? t.profileSubmitting : t.profileSubmitVerification}
                                </button>
                                <button onClick={() => { setSelfieImg(null); }} disabled={kycSubmitting}
                                  className="text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors disabled:opacity-60">
                                  {t.profileRetakePhoto}
                                </button>
                              </>
                            ) : (
                              <button onClick={captureSelfie} disabled={!!camError || capturing}
                                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                                style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#0A0612] stroke-2">
                                  <circle cx="12" cy="13" r="4"/><path d="M9 3h6l2 2h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3z"/>
                                </svg>
                                {t.profileCapturePhoto}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={setAuthMode} />
    </>
  );
}
