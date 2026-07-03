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
import GameSection from "@/components/home/GameSection";
import LiveSports from "@/components/home/LiveSports";
import { SLOT_GAMES, LIVE_CASINO_GAMES, POKER_GAMES } from "@/lib/data";
import JackpotBanner from "@/components/home/JackpotBanner";
import WelcomeBonus from "@/components/home/WelcomeBonus";
import HowItWorks from "@/components/home/HowItWorks";
import PaymentMethods from "@/components/home/PaymentMethods";
import CtaStrip from "@/components/home/CtaStrip";
import ChatSupport from "@/components/site/ChatSupport";
import { useLang } from "@/lib/language";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const { t } = useLang();

  useEffect(() => {
    const tm = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(tm);
  }, []);

  return (
    <>
      <Loader done={!loading} />
      <PromoPopup trigger={!loading} onOpenAuth={setAuthMode} />

      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <div className="relative min-h-screen overflow-x-hidden bg-[#0A0612] text-white antialiased">
        <AmbientBackground />
        <Header onOpenAuth={setAuthMode} />

        <HeroSlider />
        <ProviderStrip />
        <LiveWinsTicker />
        <CategoryChips />

        <Reveal><HotGames /></Reveal>

        <Reveal>
          <GameSection
            title={<>{t.slotsWord} <span className="text-[#9B30FF]">{t.slotsHighlight}</span></>}
            games={SLOT_GAMES}
            barFrom="#9B30FF"
            barTo="#D4AF37"
            eyebrowColor="#C9B8E8"
          />
        </Reveal>

        <Reveal>
          <GameSection
            title={<>{t.lcWord} <span className="text-[#22d3ee]">{t.lcHighlight}</span></>}
            games={LIVE_CASINO_GAMES}
            barFrom="#22d3ee"
            barTo="#3b82f6"
            eyebrowColor="#7DCFEF"
          />
        </Reveal>

        <Reveal>
          <GameSection
            title={<>{t.pokerWord} <span className="text-[#F5C842]">{t.pokerHighlight}</span></>}
            games={POKER_GAMES}
          />
        </Reveal>

        <Reveal><LiveSports /></Reveal>
        <Reveal><JackpotBanner run={!loading} /></Reveal>
        <Reveal><WelcomeBonus onOpenAuth={setAuthMode} /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <Reveal><PaymentMethods /></Reveal>
        <Reveal><CtaStrip onOpenAuth={setAuthMode} /></Reveal>

        <Footer />
        <ChatSupport />
        <BackToTop />
      </div>
    </>
  );
}
