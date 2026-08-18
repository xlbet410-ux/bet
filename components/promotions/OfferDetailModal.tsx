"use client";

import Image from "next/image";
import { FaXmark } from "react-icons/fa6";
import type { PublicOffer } from "@/lib/offers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const GOLD = "#F8BB25";

function buildBonusRows(offer: PublicOffer, lang: string): { label: string; value: string }[] {
  const L =
    lang === "bn"
      ? {
          bonusPct: "বোনাস %",
          bonusAmt: "বোনাস পরিমাণ",
          bonusRange: "বোনাস রেঞ্জ",
          maxBonus: "সর্বোচ্চ বোনাস",
          wager: "ওয়েজার",
          validity: "মেয়াদ",
          days: "দিন",
        }
      : {
          bonusPct: "Bonus %",
          bonusAmt: "Bonus Amount",
          bonusRange: "Bonus Range",
          maxBonus: "Max Bonus",
          wager: "Wager",
          validity: "Validity",
          days: "days",
        };

  const rows: { label: string; value: string }[] = [];

  if (offer.rewardType === "percentage" && offer.rewardAmount) {
    rows.push({ label: L.bonusPct, value: `${offer.rewardAmount}%` });
    if (offer.rewardCap) rows.push({ label: L.maxBonus, value: `৳${Number(offer.rewardCap).toLocaleString()}` });
  } else if (offer.rewardType === "fixed" && offer.rewardAmount) {
    rows.push({ label: L.bonusAmt, value: `৳${Number(offer.rewardAmount).toLocaleString()}` });
  } else if (offer.rewardType === "random" && offer.rewardMin && offer.rewardMax) {
    rows.push({
      label: L.bonusRange,
      value: `৳${Number(offer.rewardMin).toLocaleString()} - ৳${Number(offer.rewardMax).toLocaleString()}`,
    });
  }

  if (Number(offer.turnoverMultiplier) > 0) {
    rows.push({ label: L.wager, value: `${offer.turnoverMultiplier}x` });
  }
  if (offer.bonusValidityDays) {
    rows.push({ label: L.validity, value: `${offer.bonusValidityDays} ${L.days}` });
  }
  // Repetition / Game Type / Min Deposit / Max Withdrawal slot in here once
  // those fields exist on the public offer payload — each is just another
  // rows.push({ label, value }), skipped whenever the offer doesn't set it.

  return rows;
}

// Splits a single free-text field into sentence-sized bullets. Placeholder
// for Steps to Claim until a dedicated, admin-authored stepsToClaim field
// exists — same idea used for the Terms & Conditions list below.
function toBullets(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function OfferDetailModal({
  offer,
  lang,
  onClose,
}: {
  offer: PublicOffer;
  lang: string;
  onClose: () => void;
}) {
  const strings =
    lang === "bn"
      ? { steps: "দাবি করার ধাপ", bonusInfo: "বোনাস তথ্য", terms: "শর্তাবলী" }
      : { steps: "Steps to Claim", bonusInfo: "Bonus Information", terms: "Terms & Conditions" };

  const title = (lang === "bn" ? offer.titleBn : offer.titleEn) || offer.titleBn;
  const description = (lang === "bn" ? offer.descriptionBn : offer.descriptionEn) || offer.descriptionBn;
  const terms = (lang === "bn" ? offer.termsBn : offer.termsEn) || offer.termsBn;

  const bonusRows = buildBonusRows(offer, lang);
  const steps = toBullets(description);
  const termsList = toBullets(terms);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden"
        style={{ background: "#333231", borderRadius: "3px" }}
      >
        <div className="relative aspect-video w-full shrink-0 bg-[#1B0838]">
          {offer.imageUrl && (
            <Image
              src={`${API_URL}${offer.imageUrl}`}
              alt={title}
              fill
              sizes="400px"
              className="object-cover"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <FaXmark />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-[13px] italic" style={{ color: "rgba(255,255,255,.8)" }}>
              {description}
            </p>
          )}

          {steps.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold" style={{ color: GOLD }}>
                {strings.steps}
              </p>
              <ul className="flex flex-col gap-1.5 text-[13px]" style={{ color: "#E7E5E0" }}>
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: GOLD }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bonusRows.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold" style={{ color: GOLD }}>
                {strings.bonusInfo}
              </p>
              <div className="overflow-hidden" style={{ border: "1px solid #4A453F", borderRadius: "3px" }}>
                {bonusRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[45%_55%]"
                    style={{ borderTop: i > 0 ? "1px solid #4A453F" : undefined }}
                  >
                    <div
                      className="px-3 py-2 text-[13px] font-medium"
                      style={{ background: GOLD, color: "#1A1A1A", borderRight: "1px solid #4A453F" }}
                    >
                      {row.label}
                    </div>
                    <div
                      className="px-3 py-2 text-center text-[13px]"
                      style={{ background: "#3A3634", color: "#E7E5E0" }}
                    >
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {termsList.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold" style={{ color: GOLD }}>
                {strings.terms}
              </p>
              <ul className="flex flex-col gap-1.5 text-[13px]" style={{ color: "#E7E5E0" }}>
                {termsList.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: GOLD }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
