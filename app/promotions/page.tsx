"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaGift, FaCircleCheck, FaLayerGroup } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getOffers, claimOffer, GAME_CATEGORY_LABELS, type PublicOffer, type GameCategoryId } from "@/lib/offers";
import { RedEnvelope } from "@/components/promotions/RedEnvelope";
import { PromotionCard } from "@/components/promotions/PromotionCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};

// "all" and "deposit" ("Welcome Bonus") are always-shown pseudo-categories
// — "deposit" is the real offer.category value welcome/deposit bonuses
// already use, just relabeled here. Game-section tabs (Slots, Live Casino,
// ...) are NOT hardcoded — they're built from whatever offers are actually
// live and restricted to a specific game category (offer.eligibleGames),
// so a tab only ever appears once a matching offer really exists. Game
// tab ids are prefixed "game:" to keep them unambiguous from category ids.
const BASE_TABS: { id: string; en: string; bn: string }[] = [
  { id: "all", en: "All", bn: "সব" },
  { id: "deposit", en: "Welcome Bonus", bn: "ওয়েলকাম বোনাস" },
];

function gameTabId(category: GameCategoryId) {
  return `game:${category}`;
}

// For offers admin-flagged imageOnly — just the uploaded image, no title,
// description, reward badge, or padding. If the offer is a manual_claim
// type, tapping the image itself claims it (a small checkmark/spinner
// overlay is the only feedback — no text, matching the "image only" intent).
function ImageOnlyCard({
  offer,
  loggedIn,
  onRequireLogin,
  groupBadge,
  onToggleGroup,
}: {
  offer: PublicOffer;
  loggedIn: boolean;
  onRequireLogin: () => void;
  groupBadge?: number;
  onToggleGroup?: () => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(offer.alreadyClaimed);
  const isClaimable = offer.triggerType === "manual_claim";

  async function handleTap() {
    if (!isClaimable || claimed || claiming) return;
    if (!loggedIn) {
      onRequireLogin();
      return;
    }
    if (!offer.eligible) return;
    setClaiming(true);
    try {
      await claimOffer(offer.slug);
      setClaimed(true);
    } catch {
      // Image-only mode has no text area to show an error in — the tap
      // simply doesn't complete; the player can try again.
    } finally {
      setClaiming(false);
    }
  }

  const title = (offer.titleBn || offer.titleEn) ?? "";

  const image = (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#1B0838]">
      {offer.imageUrl ? (
        <Image
          src={`${API_URL}${offer.imageUrl}`}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]">
          <FaGift className="text-4xl text-[#D4AF37]/50" />
        </div>
      )}
      {isClaimable && claimed && (
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-[#4ade80]">
          <FaCircleCheck className="text-sm" />
        </span>
      )}
      {isClaimable && claiming && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </span>
      )}
      {groupBadge !== undefined && groupBadge > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleGroup?.();
          }}
          className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
        >
          <FaLayerGroup className="text-[10px]" /> +{groupBadge}
        </button>
      )}
    </div>
  );

  if (isClaimable) {
    return (
      <button
        type="button"
        onClick={handleTap}
        disabled={claiming || claimed || (!offer.eligible && loggedIn)}
        className="block w-full overflow-hidden rounded-2xl text-left disabled:cursor-default"
      >
        {image}
      </button>
    );
  }
  return <div className="overflow-hidden rounded-2xl">{image}</div>;
}

export default function PromotionsPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Reads ?category= on mount only — window isn't available during
  // prerendering, and useSearchParams() would force a Suspense boundary
  // around the whole page (same reasoning as the profile page's ?tab=).
  // Valid values are "all", "deposit", or "game:<category>" — validated
  // loosely by shape since the game-tab list itself is only known once
  // offers have loaded (see gameTabs below).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl === "all" || fromUrl === "deposit" || fromUrl?.startsWith("game:")) {
      setActiveCategory(fromUrl);
    }
  }, []);

  function selectCategory(id: string) {
    setActiveCategory(id);
    router.replace(id === "all" ? "/promotions" : `/promotions?category=${encodeURIComponent(id)}`, { scroll: false });
  }

  const t =
    lang === "bn"
      ? { title: "প্রমোশন", empty: "এই মুহূর্তে কোনো প্রমোশন নেই।", tryAgain: "আবার চেষ্টা করুন", err: "লোড করা যায়নি।" }
      : { title: "Promotions", empty: "No promotions right now.", tryAgain: "Try again", err: "Couldn't load promotions." };

  // Same retry-with-backoff pattern used for the slider/game catalog on a
  // cold backend right after deploy.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getOffers();
          if (!cancelled) {
            setOffers(list);
            setLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setError(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  // Game-section tabs (Slots, Live Casino, ...) only appear once at least
  // one live offer is actually restricted to that category via the CRM's
  // "Specific category" eligible-games setting — built straight from real
  // offer data rather than a hardcoded list, so a tab shows up (or
  // disappears) exactly when staff configure/unconfigure an offer for it.
  const gameTabs = useMemo(() => {
    const seen = new Set<GameCategoryId>();
    for (const o of offers) {
      if (o.eligibleGames?.mode === "category") seen.add(o.eligibleGames.category);
    }
    return Array.from(seen).map((category) => ({
      id: gameTabId(category),
      en: GAME_CATEGORY_LABELS[category].en,
      bn: GAME_CATEGORY_LABELS[category].bn,
    }));
  }, [offers]);

  const tabs = useMemo(() => [...BASE_TABS, ...gameTabs], [gameTabs]);

  const visibleOffers = useMemo(() => {
    if (activeCategory === "all") return offers;
    if (activeCategory.startsWith("game:")) {
      const category = activeCategory.slice("game:".length) as GameCategoryId;
      return offers.filter((o) => o.eligibleGames?.mode === "category" && o.eligibleGames.category === category);
    }
    return offers.filter((o) => o.category === activeCategory);
  }, [offers, activeCategory]);

  // Offers sharing a groupKey collapse into one "cover" card (the
  // highest-priority member — visibleOffers already arrives priority-sorted
  // from the backend) with a "+N more" badge; the rest render right after
  // it, inline in the same grid, only once that badge is tapped.
  const renderList = useMemo(() => {
    const seenGroups = new Set<string>();
    const items: { offer: PublicOffer; groupBadge?: number; groupKey?: string }[] = [];
    for (const o of visibleOffers) {
      if (o.groupKey) {
        if (seenGroups.has(o.groupKey)) continue;
        seenGroups.add(o.groupKey);
        const members = visibleOffers.filter((x) => x.groupKey === o.groupKey);
        items.push({ offer: members[0], groupBadge: members.length - 1, groupKey: o.groupKey });
        if (expandedGroups.has(o.groupKey)) {
          for (const member of members.slice(1)) items.push({ offer: member });
        }
      } else {
        items.push({ offer: o });
      }
    }
    return items;
  }, [visibleOffers, expandedGroups]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />}

      <main className="relative z-10 min-h-screen px-4 pb-20 pt-35 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
            <FaGift className="text-[#D4AF37]" /> {t.title}
          </h1>

          {!loading && !error && offers.length > 0 && (
            <div
              className="mb-5 flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {tabs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCategory(c.id)}
                  className="shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors"
                  style={
                    activeCategory === c.id
                      ? { borderColor: "#D4AF37", background: "rgba(212,175,55,.12)", color: "#F5C842" }
                      : { borderColor: "rgba(255,255,255,.1)", color: "#9B8EC4" }
                  }
                >
                  {lang === "bn" ? c.bn : c.en}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[16/11] animate-pulse rounded-2xl" style={CARD} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center text-sm text-[#7B5EA7]" style={CARD}>
              <p>{t.err}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
              >
                {t.tryAgain}
              </button>
            </div>
          ) : visibleOffers.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-sm text-[#7B5EA7]" style={CARD}>
              {t.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderList.map(({ offer: o, groupBadge, groupKey }) =>
                o.slug === "red-envelope-rain" ? (
                  <RedEnvelope
                    key={o.id}
                    offer={o}
                    lang={lang}
                    loggedIn={!!user}
                    onRequireLogin={() => setAuthMode("login")}
                  />
                ) : o.imageOnly ? (
                  <ImageOnlyCard
                    key={o.id}
                    offer={o}
                    loggedIn={!!user}
                    onRequireLogin={() => setAuthMode("login")}
                    groupBadge={groupBadge}
                    onToggleGroup={groupKey ? () => toggleGroup(groupKey) : undefined}
                  />
                ) : (
                  <PromotionCard
                    key={o.id}
                    offer={o}
                    lang={lang}
                    loggedIn={!!user}
                    onRequireLogin={() => setAuthMode("login")}
                    onRequireRegister={() => setAuthMode("register")}
                    onRegister={() => router.push("/deposit-withdraw")}
                    groupBadge={groupBadge}
                    onToggleGroup={groupKey ? () => toggleGroup(groupKey) : undefined}
                  />
                )
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
