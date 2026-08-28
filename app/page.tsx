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
import { AGENT_CODE_KEY } from "@/lib/auth";

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
  const [agentCode, setAgentCode] = useState<string | null>(null);

  // Branding splash, not a real loading gate — homepage content underneath
  // starts fetching immediately regardless of this timer. Kept just long
  // enough for the logo's entrance animation (~1.15s, see Loader.tsx) to
  // play out instead of the previous fixed 2.2s that added dead time on
  // every load regardless of connection speed.
  useEffect(() => {
    const tm = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(tm);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);
    // Silent agent affiliate link — captured but never shown as a visible
    // input (unlike ref), sent straight through at registration. Persisted
    // to sessionStorage (see AGENT_CODE_KEY) so it survives if the player
    // doesn't register right away from this exact popup — AuthModal reads
    // it back regardless of which page/button later opens the register
    // form. sessionStorage, not localStorage — it must NOT survive past
    // this browser tab/visit, or a completely unrelated later visit with
    // no referral link at all would still show a stale agent code forever.
    const agent = params.get("agent");
    if (agent) {
      setAgentCode(agent);
      sessionStorage.setItem(AGENT_CODE_KEY, agent);
    }
    // Scrub ref/agent out of the URL once captured — otherwise every
    // reload (or just leaving this tab open and coming back later) keeps
    // finding the same query params and re-triggers the register popup
    // instead of the normal offer popup, every single time.
    if (ref || agent) {
      params.delete("ref");
      params.delete("agent");
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!loading && (refCode || agentCode)) setAuthMode("register");
  }, [loading, refCode, agentCode]);

  return (
    <>
      <Loader done={!loading} />
      <PromoPopup trigger={!loading && !refCode && !agentCode} />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={(m) => setAuthMode(m)}
          initialReferralCode={refCode ?? undefined}
          initialAgentCode={agentCode ?? undefined}
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
