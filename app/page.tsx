"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/site/Loader";
import AuthModal from "@/components/site/AuthModal";
import PromoPopup from "@/components/site/PromoPopup";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AmbientBackground from "@/components/site/AmbientBackground";
import BackToTop from "@/components/ui/BackToTop";
import Reveal from "@/components/ui/Reveal";
import HeroSlider from "@/components/home/HeroSlider";
import ProviderStrip from "@/components/home/ProviderStrip";
import LiveWinsTicker from "@/components/home/LiveWinsTicker";
import CategoryChips from "@/components/home/CategoryChips";
import HotGames from "@/components/home/HotGames";
import LiveGames from "@/components/home/LiveGames";
import LiveSports from "@/components/home/LiveSports";
import JackpotBanner from "@/components/home/JackpotBanner";
import WelcomeBonus from "@/components/home/WelcomeBonus";
import HowItWorks from "@/components/home/HowItWorks";
import PaymentMethods from "@/components/home/PaymentMethods";
import CtaStrip from "@/components/home/CtaStrip";
import ChatSupport from "@/components/site/ChatSupport";

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

      <div className="relative min-h-screen overflow-x-hidden bg-[#0A0612] text-white antialiased">
        <AmbientBackground />
        <Header onOpenAuth={setAuthMode} />

        <HeroSlider />
        <ProviderStrip />
        <LiveWinsTicker />
        <CategoryChips />

        <Reveal><HotGames /></Reveal>

        <Reveal><LiveGames onOpenAuth={setAuthMode} /></Reveal>

        <Reveal><LiveSports /></Reveal>
        <Reveal><JackpotBanner run={!loading} /></Reveal>
        <Reveal><WelcomeBonus onOpenAuth={setAuthMode} /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <Reveal><PaymentMethods /></Reveal>
        <Reveal><CtaStrip onOpenAuth={setAuthMode} /></Reveal>

        <Footer />
        <ChatSupport onOpenAuth={setAuthMode} />
        <BackToTop />
      </div>
    </>
  );
}
