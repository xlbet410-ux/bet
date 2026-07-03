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
}: {
  game: GameItem;
  featured?: boolean;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const tag = game.tag ? (TAG_STYLE[game.tag] ?? TAG_STYLE.NEW) : null;

  return (
    <div
      className={`group relative cursor-pointer select-none overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
        featured ? "rounded-2xl" : "rounded-xl"
      }`}
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.65)",
        background: "#0f0720",
      }}
    >
      {/* dynamic glow border — appears on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1.5px ${game.glow}80, 0 12px 48px ${game.glow}28` }}
      />

      {/* portrait image container */}
      <div className={`relative w-full overflow-hidden ${featured ? "aspect-[2/3]" : "aspect-[3/4]"}`}>
        <Image
          src={game.img}
          alt={game.name}
          fill
          sizes={featured ? "300px" : "180px"}
          className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
        />

        {/* gradient: dark at top + strong dark at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/15" />

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

        {/* tag badge – top left */}
        {tag && (
          <span
            className={`absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tag.from} ${tag.to} px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white`}
            style={{ boxShadow: `0 0 10px ${tag.glow}70` }}
          >
            {tag.pulse && (
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white/90" />
            )}
            {game.tag}
          </span>
        )}

        {/* heart – top right */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-xs backdrop-blur-sm transition-all hover:scale-110 hover:border-[#F5C842]/60"
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

        {/* gold play button – center, appears on hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "radial-gradient(circle at 40% 35%, #fde68a, #D4AF37)",
              boxShadow: "0 0 0 5px rgba(212,175,55,0.18), 0 0 32px rgba(212,175,55,0.55)",
            }}
          >
            <FaPlay className="ml-0.5 h-4 w-4 text-[#0A0612]" />
          </div>
        </div>

        {/* bottom info overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-2.5">
          <span className="mb-1 inline-block rounded-md bg-black/55 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#F5C842] backdrop-blur-sm">
            {game.provider}
          </span>
          <p
            className={`truncate font-bold leading-tight text-white ${
              featured ? "text-base" : "text-xs"
            }`}
          >
            {game.name}
          </p>
        </div>
      </div>
    </div>
  );
}
