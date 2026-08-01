"use client";

import type { ReactNode } from "react";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";

export default function GameGrid({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
  launchingUid,
  trailingTile,
}: {
  games: GameItem[];
  favorites: Map<string, GameItem>;
  onToggleFavorite: (game: GameItem) => void;
  onPlay: (gameUid: string) => void;
  launchingUid: string | null;
  trailingTile?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((g) => (
        <GameCard
          key={g.gameUid}
          game={g}
          favorited={favorites.has(g.name)}
          onToggleFavorite={() => onToggleFavorite(g)}
          onPlay={() => g.gameUid && onPlay(g.gameUid)}
          loading={launchingUid === g.gameUid}
        />
      ))}
      {trailingTile}
    </div>
  );
}
