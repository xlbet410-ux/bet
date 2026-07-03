"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function GameSection({
  title,
  games,
  barFrom,
  barTo,
  eyebrowColor,
}: {
  title: ReactNode;
  games: GameItem[];
  barFrom?: string;
  barTo?: string;
  eyebrowColor?: string;
}) {
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
          title={title}
          barFrom={barFrom}
          barTo={barTo}
          eyebrowColor={eyebrowColor}
          action={{ label: t.viewAll }}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {games.map((g) => (
            <GameCard
              key={g.name}
              game={g}
              favorited={favorites.has(g.name)}
              onToggleFavorite={() => toggleFavorite(g.name)}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="rounded-full border-2 border-[#7B2FBE] px-8 py-3.5 font-semibold text-[#C9B8E8] transition-all hover:scale-105 hover:bg-[#7B2FBE]/20">
            {t.loadMore}
          </button>
        </div>
      </div>
    </section>
  );
}
