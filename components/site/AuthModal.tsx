"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { useAuth } from "@/lib/auth";

export default function AuthModal({
  mode,
  onClose,
  onSwitch,
}: {
  mode: "login" | "register";
  onClose: () => void;
  onSwitch: (m: "login" | "register") => void;
}) {
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [referral, setReferral] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useLang();
  const { login } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleSubmit = () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (!isLogin && name.trim().length < 2) { setError(t.authErrName); return; }
    if (digits.length < 7) { setError(t.authErrPhone); return; }
    if (password.length < 6) { setError(t.authErrPassword); return; }
    if (!isLogin) {
      if (password !== confirm) { setError(t.authErrMatch); return; }
      if (!agree) { setError(t.authErrTerms); return; }
    }
    const displayName = isLogin ? "Player " + digits.slice(-4) : name.trim();
    login(displayName, digits);
    onClose();
  };

  const inputBase =
    "w-full rounded-xl border border-[#7B2FBE]/40 bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white placeholder-[#8A7DB0] outline-none transition-all focus:border-[#D4AF37] focus:bg-white/[0.07]";

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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.25s_ease]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md animate-[popIn_0.3s_ease] overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#1B0838] to-[#0A0612] p-7 shadow-[0_0_60px_#7B2FBE40] md:p-8"
      >
        <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#9B30FF]/30 blur-3xl" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base text-[#C9B8E8] transition-all hover:bg-white/10 hover:text-white"
        >
          <FaXmark />
        </button>

        <div className="relative mb-5 flex justify-center">
          <Image src="/logo.png" alt="2XLbet Casino" width={220} height={220} className="h-20 w-auto drop-shadow-[0_0_18px_#9B30FF66]" />
        </div>

        <h2 className="relative text-center text-2xl font-extrabold">
          <span className="bg-gradient-to-r from-[#F5C842] to-[#D4AF37] bg-clip-text text-transparent">
            {isLogin ? t.authLoginTitle : t.authRegisterTitle}
          </span>
        </h2>
        <p className="relative mb-6 mt-1 text-center text-sm text-[#9B8EC4]">
          {isLogin ? t.authLoginSub : t.authRegisterSub}
        </p>

        {/* name — register only */}
        {!isLogin && (
          <div className="relative mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.authNameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.authNamePlaceholder}
              className={inputBase}
            />
          </div>
        )}

        {/* phone */}
        <div className="relative mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.authPhoneLabel}</label>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
            placeholder={t.authPhonePlaceholder}
            className={inputBase}
          />
        </div>

        {/* password */}
        <div className="relative mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.authPasswordLabel}</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.authPasswordPlaceholder}
              className={inputBase}
            />
            <EyeBtn visible={showPwd} onToggle={() => setShowPwd((v) => !v)} />
          </div>
        </div>

        {/* register-only fields */}
        {!isLogin && (
          <>
            <div className="relative mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">{t.authConfirmLabel}</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t.authPasswordPlaceholder}
                  className={inputBase}
                />
                <EyeBtn visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
              </div>
            </div>
            <div className="relative mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#C9B8E8]">
                {t.authReferralLabel} <span className="text-[#8A7DB0]">{t.authReferralOptional}</span>
              </label>
              <input
                type="text"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder={t.authReferralPlaceholder}
                className={inputBase}
              />
            </div>
            <label className="relative mb-4 flex cursor-pointer items-start gap-2 text-xs text-[#9B8EC4]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
              />
              <span>
                {t.authConsent}{" "}
                <span className="text-[#D4AF37]">{t.authTerms}</span>{" "}
                <span className="text-[#D4AF37]">{t.authPrivacy}</span>.
              </span>
            </label>
          </>
        )}

        {isLogin && (
          <div className="relative mb-4 text-right">
            <a href="#" className="text-xs text-[#D4AF37] hover:underline">{t.authForgot}</a>
          </div>
        )}

        {error && (
          <p className="relative mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="relative w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] py-3.5 text-base font-bold text-[#0A0612] shadow-[0_0_25px_#D4AF3760] transition-all hover:scale-[1.02]"
        >
          {isLogin ? t.authLoginBtn : t.authSignupBtn}
        </button>

        <p className="relative mt-5 text-center text-sm text-[#9B8EC4]">
          {isLogin ? t.authHaveAccount : t.authNoAccount}{" "}
          <button
            onClick={() => onSwitch(isLogin ? "register" : "login")}
            className="font-semibold text-[#F5C842] hover:underline"
          >
            {isLogin ? t.authSwitchToSignup : t.authSwitchToLogin}
          </button>
        </p>
      </div>
    </div>
  );
}
