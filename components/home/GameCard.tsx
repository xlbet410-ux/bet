"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaPlay } from "react-icons/fa6";
import type { GameItem } from "@/lib/data";
import { resolveSportsCardImage, GENERIC_CARD_IMAGE } from "@/lib/games";

/* --- tag colour map (all class strings must appear here for Tailwind to include them) --- */
const TAG_STYLE: Record<string, { from: string; to: string; glow: string; pulse: boolean }> = {
  HOT:      { from: "from-[#ff4d4d]", to: "to-[#f5222d]", glow: "#f5222d", pulse: true  },
  NEW:      { from: "from-[#1677ff]", to: "to-[#69b1ff]", glow: "#1677ff", pulse: false },
  JACKPOT:  { from: "from-[#D4AF37]", to: "to-[#fadb14]", glow: "#fadb14", pulse: true  },
  LIVE:     { from: "from-[#237804]", to: "to-[#73d13d]", glow: "#52c41a", pulse: true  },
  VIP:      { from: "from-[#531dab]", to: "to-[#D4AF37]", glow: "#D4AF37", pulse: false },
  POPULAR:  { from: "from-[#c41d7f]", to: "to-[#ff85c2]", glow: "#eb2f96", pulse: false },
  TRENDING: { from: "from-[#006d75]", to: "to-[#36cfc9]", glow: "#13c2c2", pulse: false },
};

// A fixed character cap keeps the provider pill a predictable short size on
// every card, instead of CSS truncation, which cuts at whatever happens to
// fit the container and looks inconsistent from card to card.
const PROVIDER_NAME_MAX = 13;
function shortProviderName(name: string): string {
  return name.length > PROVIDER_NAME_MAX ? `${name.slice(0, PROVIDER_NAME_MAX).trimEnd()}…` : name;
}

// Callbacks take the game (or its gameUid) as an argument rather than being
// pre-bound per-card by the parent, so GameGrid/GameRow can pass the exact
// same function reference to every card instead of a fresh closure each
// render — required for the memo() below to actually skip re-renders.
function GameCard({
  game,
  featured = false,
  favorited,
  onToggleFavorite,
  onPlay,
  loading = false,
}: {
  game: GameItem;
  featured?: boolean;
  favorited: boolean;
  onToggleFavorite: (game: GameItem) => void;
  onPlay?: (gameUid: string) => void;
  loading?: boolean;
}) {
  const tag = game.tag ? (TAG_STYLE[game.tag] ?? TAG_STYLE.NEW) : null;

  // Sportsbook "games" (SABA, SBO, Betby, ...) get a specific poster image
  // instead of Oracle's own thumbnail, which is consistently broken for
  // these — see resolveSportsCardImage. Anything else falls back to a
  // generic branded card if its real image 404s at runtime.
  const initialSrc = resolveSportsCardImage(game.providerCode, game.name) ?? game.img;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  return (
    <div
      onClick={() => game.gameUid && onPlay?.(game.gameUid)}
      // aspect-[4/5] matches Oracle's real thumbnail pixel size (200x250,
      // confirmed live across providers) exactly, so object-cover below
      // needs no meaningful crop — the whole poster shows as intended,
      // full-bleed, same size/shape on every card everywhere it's used.
      //
      // isolate traps this card's internal z-10/z-20 layers (badges, glow,
      // play button) in their own stacking context so they can never bleed
      // through an unrelated overlay elsewhere on the page (e.g. a search
      // dropdown) just because that overlay's own z-index happens to be
      // lower than one of these internal values.
      className={`group relative isolate select-none overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 aspect-4/5 ${
        onPlay ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        background: "#0f0720",
      }}
    >
      {/* dynamic glow border — appears on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1.5px ${game.glow}80, 0 12px 48px ${game.glow}28` }}
      />

      <Image
        src={imgSrc}
        alt={game.name}
        fill
        // Oracle's URLs were always unoptimized (external, no benefit from
        // Next's pipeline). The local sports-card overrides need it too —
        // Next's dev-server image optimizer was unreliable for these under
        // concurrent fill+sizes requests (some would just never resolve),
        // confirmed via a live network trace; serving them directly sidesteps
        // it entirely and always works.
        unoptimized
        sizes={featured ? "300px" : "200px"}
        className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
        onError={() => setImgSrc(GENERIC_CARD_IMAGE)}
      />

      {/* tag ribbon – diagonal corner flag, top-left (only when this game has a tag) */}
      {tag && (
        <div
          className={`absolute -left-8 top-3 z-10 w-28 -rotate-45 bg-gradient-to-r ${tag.from} ${tag.to} py-0.5 text-center text-[8px] font-black uppercase tracking-widest text-white sm:top-4 sm:text-[9px]`}
          style={{ boxShadow: `0 2px 8px ${tag.glow}80` }}
        >
          <span className="inline-flex items-center gap-1">
            {tag.pulse && <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-white/90" />}
            {game.tag}
          </span>
        </div>
      )}

      {/* provider badge – dark corner flag flush against the card's own
          top-left corner, capped to a fixed length so it always reads as a
          short tag rather than a cut-off word. Same corner on every
          breakpoint (no more desktop-only centering). */}
      <span
        title={game.provider}
        className="absolute left-0 top-0 z-10 whitespace-nowrap rounded-tl-lg rounded-br-lg bg-black/75 px-2.5 py-1 text-center text-[9px] font-black uppercase tracking-wide text-[#F5C842] backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[11px]"
      >
        {shortProviderName(game.provider)}
      </span>

      {/* favorite – dark corner flag flush against the top-right corner,
          mirroring the provider badge */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(game); }}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorited}
        className="absolute right-0 top-0 z-10 flex h-7 w-7 items-center justify-center rounded-tr-lg rounded-bl-lg bg-black/75 text-xs backdrop-blur-sm transition-all hover:scale-110 sm:h-9 sm:w-9 sm:text-base"
      >
        {favorited ? (
          <FaHeart
            className="text-[#F5C842]"
            style={{ filter: "drop-shadow(0 0 5px #F5C84280)" }}
          />
        ) : (
          <FaRegHeart className="text-white" />
        )}
      </button>

      {/* shine sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-all duration-700 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.09) 50%, transparent 60%)",
          animation: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animation = "shimmer 0.7s ease forwards";
        }}
      />

      {/* gold play button – center, appears on hover (or always, while launching).
          pointer-events-none: purely decorative, the root div's onClick
          already handles play — without this, its full-card hit area
          (opacity aside) silently blocked clicks on the favorite badge
          whenever it was showing on hover. */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 ${
          loading ? "bg-black/60 opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "radial-gradient(circle at 40% 35%, #fde68a, #D4AF37)",
            boxShadow: "0 0 0 5px rgba(212,175,55,0.18), 0 0 32px rgba(212,175,55,0.55)",
          }}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0612]/30 border-t-[#0A0612]" />
          ) : (
            <FaPlay className="ml-0.5 h-4 w-4 text-[#0A0612]" />
          )}
        </div>
      </div>

      {/* game name – overlaid at the bottom of the poster with a gradient
          scrim underneath it for legibility. Shows the full name, wrapping
          onto a second line for longer titles instead of cutting it off. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-2 pb-1.5 pt-7">
        <p
          title={game.name}
          className={`line-clamp-2 text-center font-bold leading-tight text-white ${
            featured ? "text-sm" : "text-[11px]"
          }`}
        >
          {game.name}
        </p>
      </div>
    </div>
  );
}

// Memoized so a re-render of a whole grid (e.g. from an unrelated search
// box's keystroke elsewhere on the page) doesn't re-render every card —
// effective as long as callers pass stable `onToggleFavorite`/`onPlay`
// references (see GameGrid/GameRow).
export default memo(GameCard);
