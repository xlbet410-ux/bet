"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaChevronRight, FaGift, FaCircleCheck, FaLayerGroup } from "react-icons/fa6";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getOffers, claimOffer, rewardLabel, type PublicOffer } from "@/lib/offers";
import { RedEnvelope } from "@/components/promotions/RedEnvelope";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CARD = {
  background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))",
  border: "1px solid rgba(255,255,255,.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,.4)",
};

// Same category set as the CRM's offer form (OffersManager.tsx) — "all" is
// a page-local pseudo-category, not a real offer.category value.
const CATEGORIES: { id: string; en: string; bn: string }[] = [
  { id: "all", en: "All", bn: "সব" },
  { id: "deposit", en: "Deposit", bn: "ডিপোজিট" },
  { id: "referral", en: "Referral", bn: "রেফারেল" },
  { id: "level", en: "VIP / Level", bn: "ভিআইপি / লেভেল" },
  { id: "daily", en: "Daily", bn: "দৈনিক" },
  { id: "cashback", en: "Cashback", bn: "ক্যাশব্যাক" },
  { id: "special", en: "Special", bn: "স্পেশাল" },
];

function PromotionCard({
  offer,
  lang,
  expanded,
  onToggle,
  loggedIn,
  onRequireLogin,
  groupBadge,
  onToggleGroup,
}: {
  offer: PublicOffer;
  lang: string;
  expanded: boolean;
  onToggle: () => void;
  loggedIn: boolean;
  onRequireLogin: () => void;
  groupBadge?: number;
  onToggleGroup?: () => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(offer.alreadyClaimed);

  const strings =
    lang === "bn"
      ? {
          view: "বিস্তারিত দেখুন",
          hide: "লুকান",
          turnover: "টার্নওভার",
          validity: "মেয়াদ",
          days: "দিন",
          terms: "শর্তাবলী",
          claim: "দাবি করুন",
          claiming: "...",
          claimed: "দাবি করা হয়েছে",
          notEligible: "আপনি এখন এই অফারের জন্য যোগ্য নন",
        }
      : {
          view: "View details",
          hide: "Hide",
          turnover: "Turnover",
          validity: "Valid for",
          days: "days",
          terms: "Terms",
          claim: "Claim",
          claiming: "...",
          claimed: "Claimed",
          notEligible: "You're not eligible for this offer right now",
        };

  const title = (lang === "bn" ? offer.titleBn : offer.titleEn) || offer.titleBn;
  const description = (lang === "bn" ? offer.descriptionBn : offer.descriptionEn) || offer.descriptionBn;
  const terms = (lang === "bn" ? offer.termsBn : offer.termsEn) || offer.termsBn;
  const reward = rewardLabel(offer, lang);

  async function handleClaim() {
    if (!loggedIn) {
      onRequireLogin();
      return;
    }
    setClaiming(true);
    setClaimError(null);
    try {
      await claimOffer(offer.slug);
      setClaimed(true);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setClaiming(false);
    }
  }

  const groupPill = groupBadge !== undefined && groupBadge > 0 && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggleGroup?.();
      }}
      className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
    >
      <FaLayerGroup className="text-[10px]" /> +{groupBadge}
    </button>
  );
  const rewardPill = reward && (
    <span
      className="rounded-full px-3 py-1 text-xs font-black text-[#0A0612]"
      style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
    >
      +{reward}
    </span>
  );

  return (
    <div className="overflow-hidden rounded-2xl" style={CARD}>
      {/* No image on this offer → skip the image area entirely (text-only
          card) instead of showing a generic placeholder box. */}
      {offer.imageUrl && (
        <div className="relative aspect-[16/8] w-full bg-[#1B0838]">
          <Image
            src={`${API_URL}${offer.imageUrl}`}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover"
          />
          {groupPill && <div className="absolute left-3 top-3">{groupPill}</div>}
          {rewardPill && <div className="absolute right-3 top-3">{rewardPill}</div>}
        </div>
      )}

      <div className="p-4">
        {!offer.imageUrl && (groupPill || rewardPill) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {groupPill}
            {rewardPill}
          </div>
        )}
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? strings.hide : strings.view}
          className="mb-1 flex w-full items-start justify-between gap-2 text-left"
        >
          <div className="min-w-0">
            <h3 className="font-extrabold text-white">{title}</h3>
            {description && !expanded && (
              <p className="mt-1 line-clamp-2 text-xs text-[#9B8EC4]">{description}</p>
            )}
          </div>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#F5C842] transition-transform"
            style={{ background: "rgba(212,175,55,.1)", transform: expanded ? "rotate(90deg)" : "none" }}
          >
            <FaChevronRight className="text-xs" />
          </span>
        </button>

        {offer.triggerType === "manual_claim" && (
          <div className="mt-2 flex items-center">
            {claimed ? (
              <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-[#4ade80]" style={{ background: "rgba(34,197,94,.15)" }}>
                <FaCircleCheck /> {strings.claimed}
              </span>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claiming || !offer.eligible}
                className="rounded-full px-4 py-1.5 text-xs font-bold text-[#0A0612] transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
              >
                {claiming ? strings.claiming : strings.claim}
              </button>
            )}
          </div>
        )}

        {claimError && <p className="mt-2 text-xs text-red-400">{claimError}</p>}
        {offer.triggerType === "manual_claim" && !offer.eligible && !claimed && (
          <p className="mt-2 text-[11px] text-[#7B5EA7]">{strings.notEligible}</p>
        )}

        {expanded && (
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-[#C9B8E8]">
            {description && <p className="leading-relaxed">{description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#9B8EC4]">
              {Number(offer.turnoverMultiplier) > 0 && (
                <span>
                  {strings.turnover}: <span className="font-bold text-[#D4AF37]">{offer.turnoverMultiplier}x</span>
                </span>
              )}
              {offer.bonusValidityDays && (
                <span>
                  {strings.validity}: <span className="font-bold text-[#D4AF37]">{offer.bonusValidityDays} {strings.days}</span>
                </span>
              )}
            </div>
            {terms && (
              <div>
                <p className="mb-1 font-semibold text-white">{strings.terms}</p>
                <p className="leading-relaxed text-[#9B8EC4]">{terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl && CATEGORIES.some((c) => c.id === fromUrl)) setActiveCategory(fromUrl);
  }, []);

  function selectCategory(id: string) {
    setActiveCategory(id);
    router.replace(id === "all" ? "/promotions" : `/promotions?category=${id}`, { scroll: false });
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

  const visibleOffers = useMemo(
    () => (activeCategory === "all" ? offers : offers.filter((o) => o.category === activeCategory)),
    [offers, activeCategory]
  );

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
              {CATEGORIES.map((c) => (
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
                    expanded={expandedId === o.id}
                    onToggle={() => setExpandedId((cur) => (cur === o.id ? null : o.id))}
                    loggedIn={!!user}
                    onRequireLogin={() => setAuthMode("login")}
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
