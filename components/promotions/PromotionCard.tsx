"use client";

import { useState } from "react";
import Image from "next/image";
import { FaClock, FaLayerGroup, FaCircleCheck } from "react-icons/fa6";
import { claimOffer, type PublicOffer } from "@/lib/offers";
import { OfferDetailModal } from "./OfferDetailModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  onRegister,
  groupBadge,
  onToggleGroup,
}: {
  offer: PublicOffer;
  lang: string;
  loggedIn: boolean;
  onRequireLogin: () => void;
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
          claim: "দাবি করুন",
          claiming: "...",
          claimed: "দাবি করা হয়েছে",
          notEligible: "আপনি এখন এই অফারের জন্য যোগ্য নন",
        }
      : {
          detail: "Detail",
          register: "Register Now",
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
      onRequireLogin();
      return;
    }
    onRegister();
  }

  return (
    <>
      <div className="overflow-hidden" style={{ background: "#333231", borderRadius: "3px" }}>
        <div className="relative aspect-video w-full bg-[#1B0838]">
          {offer.imageUrl ? (
            <Image
              src={`${API_URL}${offer.imageUrl}`}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#4A0E8F] to-[#1B0838]" />
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
                {strings.register}
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
