"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import Header from "@/components/site/Header";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { launchGame } from "@/lib/games";

export default function PlayPage({ params }: { params: Promise<{ gameUid: string }> }) {
  const { gameUid } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No fetch when logged out — the render below shows a login prompt
    // instead and never reaches the `loading` branch, so its stuck-true
    // value here is harmless.
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const { gameUrl: url } = await launchGame(gameUid);
        if (!cancelled) {
          setGameUrl(url);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [gameUid, user]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <main className="relative z-10 flex h-screen flex-col pt-16 sm:pt-20">
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#0A0612] px-4 py-2.5 sm:px-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#C9B8E8] transition-colors hover:border-[#D4AF37]/40 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            <FaArrowLeft className="h-3 w-3" />
            {lang === "bn" ? "ফিরে যান" : "Back"}
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-[#7B5EA7]">
                {lang === "bn" ? "খেলতে লগইন করুন।" : "Log in to play this game."}
              </p>
              <button
                onClick={() => setAuthMode("login")}
                className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
              >
                {lang === "bn" ? "লগ ইন" : "Log In"}
              </button>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4AF37]/30 border-t-[#F5C842]" />
            </div>
          ) : error || !gameUrl ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-[#7B5EA7]">
                {lang === "bn" ? "গেমটি চালু করা যায়নি।" : "Couldn't launch this game right now."}
              </p>
              <button
                onClick={() => router.back()}
                className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
              >
                {lang === "bn" ? "ফিরে যান" : "Go Back"}
              </button>
            </div>
          ) : (
            <iframe
              src={gameUrl}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; payment"
              allowFullScreen
            />
          )}
        </div>
      </main>
    </>
  );
}
