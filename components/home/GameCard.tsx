"use client";

import Image from "next/image";
import { FaStar, FaRegStar, FaPlay } from "react-icons/fa6";
import type { GameItem } from "@/lib/data";

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

export default function GameCard({
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
  onToggleFavorite: () => void;
  onPlay?: () => void;
  loading?: boolean;
}) {
  const tag = game.tag ? (TAG_STYLE[game.tag] ?? TAG_STYLE.NEW) : null;

  return (
    <div
      onClick={onPlay}
      // aspect-[4/5] matches Oracle's real thumbnail pixel size (200x250,
      // confirmed live across providers) exactly, so object-cover below
      // needs no meaningful crop — the whole poster shows as intended,
      // full-bleed, same size/shape on every card everywhere it's used.
      className={`group relative select-none overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 aspect-[4/5] ${
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
        src={game.img}
        alt={game.name}
        fill
        unoptimized={game.img.startsWith('http')}
        sizes={featured ? "300px" : "200px"}
        className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
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

      {/* provider badge – top center, white pill */}
      <span className="absolute left-1/2 top-1 z-10 max-w-[70%] -translate-x-1/2 truncate rounded-full bg-white px-2 py-0.5 text-center text-[8px] font-black uppercase tracking-wide text-[#0A0612] shadow-sm sm:top-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
        {game.provider}
      </span>

      {/* star – top right, small on mobile so it doesn't cover the art */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorited}
        className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-black/40 text-[9px] backdrop-blur-sm transition-all hover:scale-110 hover:border-[#F5C842]/60 sm:right-1.5 sm:top-1.5 sm:h-7 sm:w-7 sm:text-xs"
      >
        {favorited ? (
          <FaStar
            className="text-[#F5C842]"
            style={{ filter: "drop-shadow(0 0 5px #F5C84280)" }}
          />
        ) : (
          <FaRegStar className="text-white/70" />
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

      {/* gold play button – center, appears on hover (or always, while launching) */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 ${
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
          scrim underneath it for legibility, full-bleed poster style */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-1.5 pt-6">
        <p
          className={`truncate px-2 text-center font-bold leading-tight text-white ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {game.name}
        </p>
      </div>
    </div>
  );
}
