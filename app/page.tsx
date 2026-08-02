"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/site/Loader";
import AuthModal from "@/components/site/AuthModal";
import PromoPopup from "@/components/site/PromoPopup";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AmbientBackground from "@/components/site/AmbientBackground";
import BackToTop from "@/components/ui/BackToTop";
import Reveal from "@/components/ui/Reveal";
import HeroSlider from "@/components/home/HeroSlider";
import LiveWinsTicker from "@/components/home/LiveWinsTicker";
import LiveGames from "@/components/home/LiveGames";
import CtaStrip from "@/components/home/CtaStrip";
import ChatSupport from "@/components/site/ChatSupport";

// This route is entirely client-rendered (all data loads via useEffect), so
// there's nothing to gain from Next's Full Route Cache — and a stale cached
// shell here can keep serving an old JS bundle hash after a deploy until a
// reload forces revalidation. Force dynamic rendering so every request gets
// the current build's shell.
export const dynamic = "force-dynamic";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const tm = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(tm);
  }, []);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setRefCode(ref);
  }, []);

  useEffect(() => {
    if (!loading && refCode) setAuthMode("register");
  }, [loading, refCode]);

  return (
    <>
      <Loader done={!loading} />
      <PromoPopup trigger={!loading && !refCode} />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={(m) => setAuthMode(m)}
          initialReferralCode={refCode ?? undefined}
        />
      )}

      <div className="relative min-h-screen overflow-x-hidden bg-[#0A0612] pb-20 text-white antialiased lg:pb-0">
        <AmbientBackground />
        <Header onOpenAuth={setAuthMode} />

        <HeroSlider />

        <LiveGames onOpenAuth={setAuthMode} />

        <LiveWinsTicker />
        <Reveal><CtaStrip onOpenAuth={setAuthMode} /></Reveal>

        <Footer />
        <ChatSupport onOpenAuth={setAuthMode} />
        <BackToTop />
        <MobileBottomNav onOpenAuth={setAuthMode} />
      </div>
    </>
  );
}
