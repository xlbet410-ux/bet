"use client";

import Image from "next/image";
import { FaHeart, FaRegHeart, FaPlay } from "react-icons/fa6";
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
      className={`group relative select-none overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 ${
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

      {/* portrait image container */}
      <div className={`relative w-full overflow-hidden ${featured ? "aspect-[2/3]" : "aspect-square"}`}>
        <Image
          src={game.img}
          alt={game.name}
          fill
          unoptimized={game.img.startsWith('http')}
          sizes={featured ? "300px" : "160px"}
          className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
        />

        {/* provider badge – top left, small on mobile so it doesn't cover the art */}
        <span className="absolute left-1 top-1 z-10 max-w-[60%] truncate rounded sm:rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] sm:left-1.5 sm:top-1.5 sm:max-w-[75%] sm:px-2 sm:py-1 sm:text-xs font-black uppercase tracking-wide text-white backdrop-blur-sm">
          {game.provider}
        </span>

        {/* provider ribbon – bottom-right corner accent */}
        <span
          className="absolute bottom-0 right-0 z-10 max-w-[45%] truncate rounded-tl-md sm:rounded-tl-lg px-1.5 py-1 text-[8px] sm:max-w-[75%] sm:px-3 sm:py-1.5 sm:text-xs font-black uppercase tracking-wide text-white"
          style={{
            background: "linear-gradient(135deg, #D4AF37, #7B2FBE)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.4)",
          }}
        >
          {game.provider}
        </span>

        {/* optional promo tag – stacks under the provider badge when present */}
        {tag && (
          <span
            className={`absolute left-1 top-6 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tag.from} ${tag.to} px-1.5 py-0.5 text-[7px] sm:left-1.5 sm:top-9 sm:px-2 sm:text-[9px] font-black uppercase tracking-widest text-white`}
            style={{ boxShadow: `0 0 10px ${tag.glow}70` }}
          >
            {tag.pulse && (
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white/90" />
            )}
            {game.tag}
          </span>
        )}

        {/* heart – top right, small on mobile so it doesn't cover the art */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/55 text-[9px] backdrop-blur-sm transition-all hover:scale-110 hover:border-[#F5C842]/60 sm:right-1.5 sm:top-1.5 sm:h-7 sm:w-7 sm:text-xs"
        >
          {favorited ? (
            <FaHeart
              className="text-[#F5C842]"
              style={{ filter: "drop-shadow(0 0 5px #F5C84280)" }}
            />
          ) : (
            <FaRegHeart className="text-white/60" />
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
      </div>

      {/* game name – plain row below the image, not overlaid */}
      <p
        className={`truncate px-2 py-2 text-center font-bold leading-tight text-white ${
          featured ? "text-sm" : "text-xs"
        }`}
      >
        {game.name}
      </p>
    </div>
  );
}
