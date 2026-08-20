"use client";

import { useState } from "react";
import { FaClock, FaLayerGroup, FaCircleCheck } from "react-icons/fa6";
import { claimOffer, localizedImage, type PublicOffer } from "@/lib/offers";
import { OfferDetailModal } from "./OfferDetailModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// A row of downward-pointing teeth cut into the bottom edge of the card
// image, like a torn ticket stub — matches the reference card design. Built
// from percentages so it scales with the card's actual width/height instead
// of a hand-typed coordinate list.
function buildZigzagClipPath(teeth: number, notchPct: number): string {
  const points = ["0% 0%", "100% 0%"];
  const step = 100 / teeth;
  for (let i = 0; i <= teeth; i++) {
    const x = 100 - i * step;
    const y = i % 2 === 0 ? 100 : 100 - notchPct;
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
}
const CARD_IMAGE_CLIP_PATH = buildZigzagClipPath(28, 6);

const CATEGORY_LABELS: Record<string, { en: string; bn: string }> = {
  deposit: { en: "Deposit", bn: "ডিপোজিট" },
  referral: { en: "Referral", bn: "রেফারেল" },
  level: { en: "VIP / Level", bn: "ভিআইপি / লেভেল" },
  daily: { en: "Daily", bn: "দৈনিক" },
  cashback: { en: "Cashback", bn: "ক্যাশব্যাক" },
  special: { en: "Special", bn: "স্পেশাল" },
};

export function PromotionCard({
  offer,
  lang,
  loggedIn,
  onRequireLogin,
  onRequireRegister,
  onRegister,
  groupBadge,
  onToggleGroup,
}: {
  offer: PublicOffer;
  lang: string;
  loggedIn: boolean;
  onRequireLogin: () => void;
  // Distinct from onRequireLogin: the "Register Now" button below is
  // labeled for signup, not sign-in — a logged-out click should open the
  // register form directly, not the login form.
  onRequireRegister: () => void;
  onRegister: () => void;
  groupBadge?: number;
  onToggleGroup?: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(offer.alreadyClaimed);

  const strings =
    lang === "bn"
      ? {
          detail: "বিস্তারিত",
          register: "রেজিস্টার করুন",
          claimNow: "এখনই দাবি করুন",
          claim: "দাবি করুন",
          claiming: "...",
          claimed: "দাবি করা হয়েছে",
          notEligible: "আপনি এখন এই অফারের জন্য যোগ্য নন",
        }
      : {
          detail: "Detail",
          register: "Register Now",
          claimNow: "Claim Now",
          claim: "Claim",
          claiming: "...",
          claimed: "Claimed",
          notEligible: "You're not eligible for this offer right now",
        };

  const title = (lang === "bn" ? offer.titleBn : offer.titleEn) || offer.titleBn;
  // Reused as a stand-in "subtitle" line under the title until a dedicated
  // subtitle field exists — see the CRM offer form for where that'd live.
  const subtitle = (lang === "bn" ? offer.descriptionBn : offer.descriptionEn) || offer.descriptionBn;
  const categoryLabel = CATEGORY_LABELS[offer.category]?.[lang === "bn" ? "bn" : "en"] ?? offer.category;
  const isManualClaim = offer.triggerType === "manual_claim";
  const image = localizedImage(offer.imageUrl, offer.imageUrlEn, lang);

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

  function handleRegisterClick() {
    if (!loggedIn) {
      onRequireRegister();
      return;
    }
    onRegister();
  }

  return (
    <>
      <div className="overflow-hidden" style={{ background: "#333231", borderRadius: "3px" }}>
        {/* Same color as the card's content panel below — this is what the
            zigzag notches (clip-path cut into the image) reveal. */}
        <div className="relative w-full bg-[#333231]">
          {image ? (
            // Plain <img>, not next/image: these are variable-aspect-ratio
            // banners uploaded per-offer, so we can't pre-declare a
            // width/height — natural width:100%/height:auto is what shows
            // the full image with no cropping and no letterboxing.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_URL}${image}`}
              alt={title}
              className="block h-auto w-full"
              style={{ clipPath: CARD_IMAGE_CLIP_PATH, WebkitClipPath: CARD_IMAGE_CLIP_PATH }}
            />
          ) : (
            <div className="aspect-12/5 w-full bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]" />
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

        <div className="p-3.5">
          <h3 className="text-[16px] font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="mt-1 line-clamp-1 text-[13px]" style={{ color: "rgba(255,255,255,.9)" }}>
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-[13px]" style={{ color: "#8C8C8C" }}>
            <FaClock className="text-[11px]" />
            <span>{categoryLabel}</span>
          </div>

          <div className="mt-3 flex gap-2">
            {isManualClaim ? (
              claimed ? (
                <span
                  className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-bold"
                  style={{ background: "rgba(34,197,94,.15)", color: "#4ade80", borderRadius: "3px" }}
                >
                  <FaCircleCheck /> {strings.claimed}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claiming || !offer.eligible}
                  className="flex-1 py-2.5 text-xs font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "#DAD9D4", color: "#1A1A1A", borderRadius: "3px" }}
                >
                  {claiming ? strings.claiming : strings.claim}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleRegisterClick}
                className="flex-1 py-2.5 text-xs font-bold"
                style={{ background: "#DAD9D4", color: "#1A1A1A", borderRadius: "3px" }}
              >
                {loggedIn ? strings.claimNow : strings.register}
              </button>
            )}
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="flex-1 py-2.5 text-xs font-bold"
              style={{ background: "#F8BB25", color: "#1A1A1A", borderRadius: "3px" }}
            >
              {strings.detail}
            </button>
          </div>

          {claimError && <p className="mt-2 text-xs text-red-400">{claimError}</p>}
          {isManualClaim && !offer.eligible && !claimed && (
            <p className="mt-2 text-[11px]" style={{ color: "#8C8C8C" }}>
              {strings.notEligible}
            </p>
          )}
        </div>
      </div>

      {detailOpen && <OfferDetailModal offer={offer} lang={lang} onClose={() => setDetailOpen(false)} />}
    </>
  );
}
