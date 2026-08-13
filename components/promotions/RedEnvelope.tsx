"use client";

import { useMemo, useState } from "react";
import { FaGift } from "react-icons/fa6";
import { claimOffer, type PublicOffer } from "@/lib/offers";

// Small gold coin/spark burst fired once the envelope reveals its amount —
// each particle gets a random angle/distance computed once and passed in as
// CSS custom properties consumed by the `coinBurst` keyframe (globals.css).
function CoinBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 60 + Math.random() * 50;
        return {
          id: i,
          tx: `${Math.cos(angle) * distance}px`,
          ty: `${Math.sin(angle) * distance}px`,
          tr: `${Math.round(Math.random() * 360)}deg`,
          delay: `${Math.random() * 120}ms`,
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute h-2.5 w-2.5 rounded-full"
          style={
            {
              background: "linear-gradient(135deg,#F5C842,#D4AF37)",
              boxShadow: "0 0 6px rgba(245,200,66,.8)",
              "--tx": p.tx,
              "--ty": p.ty,
              "--tr": p.tr,
              animation: `coinBurst 0.9s ease-out ${p.delay} forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function RedEnvelope({
  offer,
  lang,
  loggedIn,
  onRequireLogin,
}: {
  offer: PublicOffer;
  lang: string;
  loggedIn: boolean;
  onRequireLogin: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "opening" | "revealed">(
    offer.alreadyClaimed ? "revealed" : "idle"
  );
  const [amount, setAmount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(offer.alreadyClaimed);

  const title = (lang === "bn" ? offer.titleBn : offer.titleEn) || offer.titleBn;
  const t =
    lang === "bn"
      ? {
          tap: "খুলতে ট্যাপ করুন",
          opening: "খোলা হচ্ছে...",
          won: "আপনি জিতেছেন",
          claimed: "আজকের জন্য খোলা হয়েছে",
          comeBack: "আগামীকাল আবার আসুন",
          notEligible: "এই মুহূর্তে উপলব্ধ নয়",
        }
      : {
          tap: "Tap to open",
          opening: "Opening...",
          won: "You won",
          claimed: "Opened for today",
          comeBack: "Come back tomorrow",
          notEligible: "Not available right now",
        };

  async function handleTap() {
    if (claimed || phase !== "idle") return;
    if (!loggedIn) {
      onRequireLogin();
      return;
    }
    if (!offer.eligible) return;

    setError(null);
    setPhase("opening");
    try {
      const [result] = await Promise.all([
        claimOffer(offer.slug),
        new Promise((r) => setTimeout(r, 900)),
      ]);
      setAmount(result.rewardAmount);
      setClaimed(true);
      setPhase("revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("idle");
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(160deg,#3a0f12,#1c0509 60%,#0A0612)",
        border: "1px solid rgba(245,200,66,.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      }}
    >
      <div className="mb-4 text-center">
        <h3 className="text-sm font-extrabold text-white">{title}</h3>
      </div>

      <button
        type="button"
        onClick={handleTap}
        disabled={claimed || phase === "opening" || (!offer.eligible && loggedIn)}
        aria-label={t.tap}
        className="relative mx-auto flex h-40 w-full max-w-[220px] items-center justify-center disabled:cursor-not-allowed"
        style={{ perspective: "600px" }}
      >
        {/* Ambient glow behind the envelope */}
        <span
          className="absolute h-28 w-28 rounded-full"
          style={{
            background: "radial-gradient(circle,rgba(245,200,66,.45),transparent 70%)",
            animation: phase === "idle" ? "envelopeGlow 2.6s ease-in-out infinite" : "none",
          }}
        />

        {phase === "revealed" ? (
          <div className="relative flex flex-col items-center gap-1" style={{ animation: "rewardPop 0.5s ease-out" }}>
            <CoinBurst />
            <FaGift className="text-3xl" style={{ color: "#F5C842" }} />
            {amount ? (
              <>
                <p className="text-[11px] font-medium text-[#F5C842]/80">{t.won}</p>
                <p
                  className="text-2xl font-black"
                  style={{ color: "#F5C842", textShadow: "0 0 16px rgba(245,200,66,.6)" }}
                >
                  ৳{Number(amount).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-xs font-bold text-[#F5C842]">{t.claimed}</p>
            )}
            <p className="mt-1 text-[10px] text-[#C9A876]/70">{t.comeBack}</p>
          </div>
        ) : (
          <div
            className="relative flex h-24 w-32 items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              animation: phase === "opening" ? "envelopeShake 0.5s ease-in-out" : "none",
            }}
          >
            {/* Envelope body */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "linear-gradient(160deg,#D42E2E,#8E1616)",
                border: "1px solid rgba(245,200,66,.5)",
                boxShadow: "0 6px 20px rgba(0,0,0,.4)",
              }}
            />
            {/* Gold seal */}
            <div
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-black"
              style={{
                background: "linear-gradient(135deg,#F5C842,#D4AF37)",
                color: "#5A1010",
                boxShadow: "0 0 10px rgba(245,200,66,.7)",
                opacity: phase === "opening" ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              ৳
            </div>
            {/* Flap */}
            <div
              className="absolute left-0 top-0 h-12 w-full origin-top"
              style={{
                background: "linear-gradient(160deg,#E4433F,#A31F1F)",
                clipPath: "polygon(0 0, 100% 0, 50% 85%)",
                borderTopLeftRadius: "0.5rem",
                borderTopRightRadius: "0.5rem",
                transformStyle: "preserve-3d",
                animation: phase === "opening" ? "envelopeFlapOpen 0.6s ease-in 0.3s forwards" : "none",
              }}
            />
          </div>
        )}
      </button>

      {phase === "idle" && !claimed && (
        <p className="mt-3 text-center text-xs font-bold text-[#F5C842]">
          {offer.eligible || !loggedIn ? t.tap : t.notEligible}
        </p>
      )}
      {phase === "opening" && <p className="mt-3 text-center text-xs text-[#C9A876]">{t.opening}</p>}
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
