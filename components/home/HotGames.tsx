"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GameCard from "./GameCard";
import { FEATURED_GAME, GRID_GAMES } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function HotGames() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { t } = useLang();

  const toggleFavorite = (name: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });

  return (
    <section className="relative z-10 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.recommend}
          title={<>{t.hotWord} <span className="text-[#F5C842]">{t.hotHighlight}</span></>}
          action={{ label: t.viewAll }}
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* featured card – fixed width on desktop so it doesn't stretch */}
          <div className="w-full lg:w-52 lg:shrink-0">
            <GameCard
              game={FEATURED_GAME}
              featured
              favorited={favorites.has(FEATURED_GAME.name)}
              onToggleFavorite={() => toggleFavorite(FEATURED_GAME.name)}
            />
          </div>

          {/* grid of portrait cards */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {GRID_GAMES.map((g) => (
              <GameCard
                key={g.name}
                game={g}
                favorited={favorites.has(g.name)}
                onToggleFavorite={() => toggleFavorite(g.name)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button className="rounded-full border border-[#7B2FBE]/60 bg-[#7B2FBE]/10 px-8 py-3 text-sm font-semibold text-[#C9B8E8] backdrop-blur-sm transition-all hover:scale-105 hover:border-[#9B30FF] hover:bg-[#7B2FBE]/20 hover:text-white">
            {t.loadMoreGames}
          </button>
        </div>
      </div>
    </section>
  );
}
