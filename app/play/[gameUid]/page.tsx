"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/site/Header";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { launchGame, openGame, NINE_WICKET_GAME_UID } from "@/lib/games";

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

    // 9Wicket can't run inside this page's iframe (unlike every other
    // game) — someone landing directly on this URL (bookmark, back
    // button, shared link) instead of clicking Play still needs the
    // new-tab flow, not a blank iframe. Hand off to openGame and leave
    // this page — there's nothing for it to render for this gameUid.
    if (gameUid === NINE_WICKET_GAME_UID) {
      void openGame(gameUid, router);
      router.replace("/");
      return;
    }

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
    // Deliberately keyed on user?.id, not the user object itself — a live
    // balance update (see lib/auth.tsx's SSE subscription) creates a new
    // user object on every bet settlement, and re-launching the game here
    // would reload the iframe mid-play. The game's own balance already
    // updates live through its own provider session; this effect only
    // needs to run once per game/login, not on every balance tick.
  }, [gameUid, user?.id]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      {/* h-dvh (not h-screen/100vh) — on mobile browsers 100vh is measured
          against the viewport with the address/toolbar chrome hidden, so the
          page renders taller than what's actually visible and the game's own
          bottom controls end up hidden behind the browser's bottom bar. The
          dynamic viewport unit tracks the chrome's real, current height. */}
      <main className="relative z-10 flex h-dvh flex-col pt-26.5 sm:pt-31 lg:pt-20">
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
