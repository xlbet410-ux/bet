"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";

type Tab     = "profile" | "wallet" | "deposit" | "kyc";
type KycStep = "idle" | "phone" | "otp" | "docType" | "upload" | "selfie" | "done";

const TRANSACTIONS = [
  { id:"TXN8821", type:"deposit",  label:"VISA Deposit",       amount:"+$500.00", date:"Jul 6, 2026",  status:"completed" },
  { id:"TXN8820", type:"win",      label:"Sweet Bonanza Win",   amount:"+$250.00", date:"Jul 5, 2026",  status:"completed" },
  { id:"TXN8819", type:"withdraw", label:"PayPal Withdrawal",   amount:"-$100.00", date:"Jul 3, 2026",  status:"pending"   },
  { id:"TXN8818", type:"deposit",  label:"USDT Deposit",        amount:"+$200.00", date:"Jul 1, 2026",  status:"completed" },
  { id:"TXN8817", type:"win",      label:"Lightning Roulette",  amount:"+$400.00", date:"Jun 28, 2026", status:"completed" },
  { id:"TXN8816", type:"deposit",  label:"Mastercard Deposit",  amount:"+$300.00", date:"Jun 25, 2026", status:"completed" },
];

const PAYMENT_METHODS = [
  { id:"visa",       name:"VISA",       accent:"#1565C0" },
  { id:"mastercard", name:"Mastercard", accent:"#D32F2F" },
  { id:"paypal",     name:"PayPal",     accent:"#0288D1" },
  { id:"usdt",       name:"USDT",       accent:"#26A17B" },
  { id:"bkash",      name:"bKash",      accent:"#E2136E" },
  { id:"nagad",      name:"Nagad",      accent:"#F2631F" },
];

const QUICK_AMOUNTS = [20, 50, 100, 200, 500, 1000];

const DOC_TYPES = [
  { id:"nid",      label:"National ID",       icon:"🪪" },
  { id:"passport", label:"Passport",          icon:"📘" },
  { id:"license",  label:"Driver's License",  icon:"🚗" },
];

const KYC_STEPS_LABELS = ["Phone", "OTP", "Document", "Upload", "Selfie"];

function Tick({ size = 10, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size }} className={`fill-none stroke-current stroke-2 ${className}`}>
      <polyline points="2,5.5 4,7.5 8,3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CARD  = { background:"linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))", border:"1px solid rgba(255,255,255,.07)", boxShadow:"0 8px 32px rgba(0,0,0,.4)" };
const INNER = { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" };

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const [authMode, setAuthMode]       = useState<"login"|"register"|null>(null);
  const [tab, setTab]                 = useState<Tab>("profile");

  // deposit
  const [selMethod, setSelMethod]     = useState("visa");
  const [depositAmt, setDepositAmt]   = useState("");

  // KYC
  const [kycVerified, setKycVerified] = useState(false);
  const [kycStep, setKycStep]         = useState<KycStep>("idle");
  const [kycPhone, setKycPhone]       = useState("");
  const [otpDigits, setOtpDigits]     = useState(["","","","","",""]);
  const [docType, setDocType]         = useState("");
  const [frontImg, setFrontImg]       = useState<string|null>(null);
  const [backImg, setBackImg]         = useState<string|null>(null);
  const [selfieImg, setSelfieImg]     = useState<string|null>(null);
  const [camError, setCamError]       = useState("");
  const [capturing, setCapturing]     = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  useEffect(() => { if (!user) router.replace("/"); }, [user, router]);

  useEffect(() => {
    setKycVerified(localStorage.getItem("2xlbet:kyc") === "true");
  }, []);

  // start/stop camera when entering/leaving selfie step
  useEffect(() => {
    if (kycStep === "selfie" && !selfieImg) {
      setCamError("");
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode:"user" }, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => setCamError("Camera permission denied. Please allow camera access in your browser."));
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [kycStep, selfieImg]);

  if (!user) return null;

  const accountId = "#2XL-" + user.phone.slice(-6).padStart(6, "0");
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
  function handleFile(side: "front"|"back", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      side === "front" ? setFrontImg(src) : setBackImg(src);
    };
    reader.readAsDataURL(file);
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
  function completeKyc() {
    localStorage.setItem("2xlbet:kyc", "true");
    setKycVerified(true);
    setKycStep("done");
  }
  function resetKyc() {
    localStorage.removeItem("2xlbet:kyc");
    setKycVerified(false);
    setKycStep("idle");
    setOtpDigits(["","","","","",""]);
    setFrontImg(null); setBackImg(null); setSelfieImg(null);
    setDocType(""); setKycPhone("");
  }

  // ── tabs ─────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"profile", label:"Profile", icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg> },
    { id:"wallet",  label:"Wallet",  icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 4h12a2 2 0 0 0-2-4z"/><circle cx="16" cy="14" r="1.5" className="fill-current stroke-none"/></svg> },
    { id:"deposit", label:"Deposit", icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M12 3v12m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21H4" strokeLinecap="round"/></svg> },
    { id:"kyc",     label:"KYC",     icon:<svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ];

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-6xl">

          {/* breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-[#9B8EC4]">
            <a href="/" className="transition-colors hover:text-[#F5C842]">Home</a>
            <span className="text-[#4A3870]">›</span>
            <span className="text-[#C9B8E8]">My Profile</span>
          </div>

          {/* ══ MOBILE: compact profile header ══ */}
          <div className="mb-3 flex items-center gap-4 rounded-2xl p-4 lg:hidden" style={CARD}>
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-[#0A0612]"
                style={{ background:"linear-gradient(135deg,#D4AF37,#F5C842)", boxShadow:"0 0 20px #D4AF3740" }}>
                {user.name[0].toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-white"
                style={{ background:"#22c55e", border:"2px solid #0A0612" }}>
                <Tick size={9} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-white">{user.name}</h2>
                <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                  style={{ background:"#22c55e" }}>
                  <Tick size={8} /> Verified
                </span>
              </div>
              <p className="text-xs text-[#9B8EC4]">+{user.phone}</p>
              <p className="font-mono text-[10px] text-[#7B5EA7]">{accountId}</p>
            </div>
          </div>

          {/* ══ MOBILE: always-visible 4-col tab grid ══ */}
          <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-2xl p-1.5 lg:hidden" style={CARD}>
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
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
                    <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ background:"#22c55e", border:"2.5px solid #0A0612" }}>
                      <Tick size={11} />
                    </div>
                  </div>
                  <h2 className="text-base font-extrabold text-white">{user.name}</h2>
                  <span className="mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ background:"#22c55e" }}>
                    <Tick size={8} /> Verified
                  </span>
                  <p className="mt-2 font-mono text-[11px] text-[#7B5EA7]">{accountId}</p>
                </div>
                <div className="mb-3 h-px" style={{ background:"rgba(255,255,255,.06)" }} />
                <nav className="flex flex-col gap-1">
                  {tabs.map((tb) => (
                    <button key={tb.id} onClick={() => setTab(tb.id)}
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
                <div className="rounded-2xl p-6" style={CARD}>
                  <h3 className="mb-5 text-lg font-extrabold text-white">Account Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label:"Full Name",     value:user.name,         extra:null       },
                      { label:"Phone Number",  value:`+${user.phone}`,  extra:"verified" },
                      { label:"Account ID",    value:accountId,         extra:null       },
                      { label:"Member Since",  value:"July 2026",       extra:null       },
                      { label:"Account Level", value:"Standard Player", extra:null       },
                      { label:"Status",        value:"Active",          extra:"active"   },
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
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
                    <p className="mt-1 text-sm text-purple-200/50">Available to play</p>
                  </div>
                  <div className="rounded-2xl p-5" style={CARD}>
                    <h3 className="mb-4 font-extrabold text-white">Recent Transactions</h3>
                    <div className="space-y-2">
                      {TRANSACTIONS.map((tx) => {
                        const isOut = tx.type === "withdraw";
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
                              <div>
                                <p className="text-sm font-semibold text-white">{tx.label}</p>
                                <p className="text-[11px] text-[#9B8EC4]">{tx.id} · {tx.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold tabular-nums ${isOut ? "text-red-400" : "text-green-400"}`}>{tx.amount}</p>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={tx.status === "completed"
                                  ? { background:"rgba(34,197,94,.1)", color:"#4ade80" }
                                  : { background:"rgba(234,179,8,.1)", color:"#facc15" }}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ DEPOSIT ════ */}
              {tab === "deposit" && (
                <div className="rounded-2xl p-6" style={CARD}>
                  <h3 className="mb-5 text-lg font-extrabold text-white">Make a Deposit</h3>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">Payment Method</p>
                  <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {PAYMENT_METHODS.map((m) => (
                      <button key={m.id} onClick={() => setSelMethod(m.id)}
                        className="rounded-xl py-3 text-xs font-bold transition-all"
                        style={selMethod === m.id
                          ? { background:`${m.accent}25`, border:`1px solid ${m.accent}70`, color:"#fff", boxShadow:`0 0 20px ${m.accent}25` }
                          : { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", color:"#9B8EC4" }}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">Quick Amount</p>
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button key={amt} onClick={() => setDepositAmt(String(amt))}
                        className="rounded-xl py-2.5 text-sm font-bold transition-all"
                        style={depositAmt === String(amt)
                          ? { background:"rgba(212,175,55,.15)", border:"1px solid rgba(212,175,55,.5)", color:"#F5C842" }
                          : { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", color:"#9B8EC4" }}>
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7B5EA7]">Custom Amount</p>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#9B8EC4]">$</span>
                    <input type="number" min="10" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 py-3 pl-8 pr-4 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[.07]" />
                  </div>
                  <button className="w-full rounded-full py-4 text-base font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                    style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)", boxShadow:"0 0 32px rgba(212,175,55,.35)" }}>
                    Deposit{depositAmt ? ` $${depositAmt}` : " Now"}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[#7B5EA7]">Minimum $10 · SSL encrypted · Instant processing</p>
                </div>
              )}

              {/* ════ KYC ════ */}
              {tab === "kyc" && (
                <div className="space-y-4">

                  {/* ── Already verified ── */}
                  {kycVerified && kycStep !== "idle" ? (
                    <div className="rounded-2xl p-10 text-center" style={CARD}>
                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                        style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", boxShadow:"0 0 40px rgba(34,197,94,.4)" }}>
                        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-white stroke-2">
                          <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-2xl font-extrabold text-white">You Are Verified!</h3>
                      <p className="mb-6 text-[#9B8EC4]">Your identity has been successfully verified. You have full access to all features.</p>
                      <div className="mx-auto mb-6 grid max-w-sm grid-cols-2 gap-3">
                        {["Phone Verified","ID Verified","Address Verified","Selfie Verified"].map((s) => (
                          <div key={s} className="flex items-center gap-2 rounded-xl p-3" style={INNER}>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background:"#22c55e" }}>
                              <Tick size={9} />
                            </span>
                            <span className="text-xs font-medium text-[#C9B8E8]">{s}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={resetKyc} className="text-xs text-[#7B5EA7] hover:text-[#9B8EC4] underline transition-colors">
                        Reset verification (demo)
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
                      <h3 className="mb-2 text-xl font-extrabold text-white">Identity Verification</h3>
                      <p className="mb-2 text-sm text-[#9B8EC4]">Verify your identity to unlock withdrawals and higher betting limits.</p>
                      <p className="mb-8 text-xs text-[#7B5EA7]">Takes about 3 minutes · Your data is encrypted and secure</p>
                      <div className="mx-auto mb-8 grid max-w-xs grid-cols-1 gap-2 text-left">
                        {["Phone number verification","Government-issued ID upload","Address proof upload","Face selfie with ID"].map((s,i) => (
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
                        Start Verification
                      </button>
                    </div>
                  ) : (
                    /* ── Multi-step flow ── */
                    <div className="rounded-2xl p-6" style={CARD}>

                      {/* progress bar */}
                      <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                          {KYC_STEPS_LABELS.map((s, i) => {
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
                          <h3 className="mb-1 text-lg font-extrabold text-white">Verify Phone Number</h3>
                          <p className="mb-6 text-sm text-[#9B8EC4]">Enter the phone number linked to your account.</p>
                          <div className="mx-auto max-w-xs">
                            <div className="relative mb-4">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9B8EC4]">+</span>
                              <input type="tel" value={kycPhone} onChange={(e) => setKycPhone(e.target.value.replace(/\D/g,""))}
                                placeholder="Enter phone number"
                                className="w-full rounded-xl border border-[#7B2FBE]/40 bg-white/4 py-3 pl-8 pr-4 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37]" />
                            </div>
                            <button onClick={() => kycPhone.length >= 7 && setKycStep("otp")}
                              disabled={kycPhone.length < 7}
                              className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                              style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                              Send OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Step 2: OTP ── */}
                      {kycStep === "otp" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">Enter OTP</h3>
                          <p className="mb-1 text-sm text-[#9B8EC4]">A 6-digit code was sent to <span className="text-white">+{kycPhone}</span></p>
                          <p className="mb-6 text-xs text-[#7B5EA7]">(Demo: any 6 digits accepted)</p>
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
                          <div className="mx-auto max-w-xs space-y-2">
                            <button onClick={() => otpDigits.every(Boolean) && setKycStep("docType")}
                              disabled={!otpDigits.every(Boolean)}
                              className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                              style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                              Verify OTP
                            </button>
                            <button onClick={() => setKycStep("phone")} className="w-full text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors">
                              ← Change phone number
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Step 3: Document type ── */}
                      {kycStep === "docType" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">Choose Document Type</h3>
                          <p className="mb-6 text-sm text-[#9B8EC4]">Select the document you will upload for identity verification.</p>
                          <div className="mx-auto mb-6 grid max-w-sm grid-cols-3 gap-3">
                            {DOC_TYPES.map((d) => (
                              <button key={d.id} onClick={() => setDocType(d.id)}
                                className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all"
                                style={docType === d.id
                                  ? { background:"rgba(212,175,55,.12)", border:"1px solid rgba(212,175,55,.5)", boxShadow:"0 0 20px rgba(212,175,55,.15)" }
                                  : { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}>
                                <span className="text-3xl">{d.icon}</span>
                                <span className={`text-xs font-semibold ${docType===d.id?"text-[#F5C842]":"text-[#9B8EC4]"}`}>{d.label}</span>
                              </button>
                            ))}
                          </div>
                          <button onClick={() => docType && setKycStep("upload")} disabled={!docType}
                            className="mx-auto block w-full max-w-xs rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                            style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                            Continue
                          </button>
                        </div>
                      )}

                      {/* ── Step 4: Upload front & back ── */}
                      {kycStep === "upload" && (
                        <div>
                          <h3 className="mb-1 text-center text-lg font-extrabold text-white">Upload Document</h3>
                          <p className="mb-6 text-center text-sm text-[#9B8EC4]">Upload clear photos of both sides of your <span className="text-white">{DOC_TYPES.find(d=>d.id===docType)?.label}</span>.</p>
                          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {(["front","back"] as const).map((side) => {
                              const img = side === "front" ? frontImg : backImg;
                              return (
                                <label key={side} className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl transition-all"
                                  style={{ minHeight:180, border: img ? "1px solid rgba(34,197,94,.4)" : "2px dashed rgba(123,47,190,.4)", background: img ? "transparent" : "rgba(123,47,190,.04)" }}>
                                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(side, e)} />
                                  {img ? (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={img} alt={side} className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 to-transparent pb-3">
                                        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background:"#22c55e" }}>
                                          <Tick size={9} /> Uploaded
                                        </span>
                                        <span className="mt-1 text-[10px] text-white/60">Click to replace</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                                      <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-[#7B2FBE] stroke-[1.5]">
                                        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5" className="fill-[#7B2FBE] stroke-none"/>
                                        <polyline points="21,15 16,10 5,21"/>
                                      </svg>
                                      <p className="font-semibold capitalize text-[#C9B8E8]">{side} side</p>
                                      <p className="text-xs text-[#7B5EA7]">Click to upload · JPG, PNG</p>
                                    </div>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                          <button onClick={() => frontImg && backImg && setKycStep("selfie")} disabled={!frontImg || !backImg}
                            className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                            style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                            Continue to Selfie
                          </button>
                        </div>
                      )}

                      {/* ── Step 5: Selfie ── */}
                      {kycStep === "selfie" && (
                        <div className="text-center">
                          <h3 className="mb-1 text-lg font-extrabold text-white">Take a Selfie</h3>
                          <p className="mb-5 text-sm text-[#9B8EC4]">Hold your <span className="text-white">{DOC_TYPES.find(d=>d.id===docType)?.label}</span> next to your face and look at the camera.</p>

                          {camError ? (
                            <div className="mx-auto mb-5 max-w-sm rounded-xl p-4 text-sm text-red-300"
                              style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)" }}>
                              {camError}
                            </div>
                          ) : selfieImg ? (
                            /* captured photo */
                            <div className="relative mx-auto mb-5 w-full max-w-xs overflow-hidden rounded-2xl"
                              style={{ border:"1px solid rgba(34,197,94,.4)" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={selfieImg} alt="selfie" className="w-full rounded-2xl" />
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background:"#22c55e" }}>
                                  <Tick size={9} /> Captured
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
                                Position your face inside the oval
                              </div>
                            </div>
                          )}

                          <canvas ref={canvasRef} className="hidden" />

                          <div className="mx-auto flex max-w-xs flex-col gap-2">
                            {selfieImg ? (
                              <>
                                <button onClick={completeKyc}
                                  className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
                                  style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                  Submit Verification
                                </button>
                                <button onClick={() => { setSelfieImg(null); }}
                                  className="text-xs text-[#7B5EA7] hover:text-[#9B8EC4] transition-colors">
                                  Retake photo
                                </button>
                              </>
                            ) : (
                              <button onClick={captureSelfie} disabled={!!camError || capturing}
                                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02] disabled:opacity-40"
                                style={{ background:"linear-gradient(to right,#D4AF37,#F5C842)" }}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#0A0612] stroke-2">
                                  <circle cx="12" cy="13" r="4"/><path d="M9 3h6l2 2h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3z"/>
                                </svg>
                                Capture Photo
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
    </>
  );
}
