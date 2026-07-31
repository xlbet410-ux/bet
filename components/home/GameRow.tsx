"use client";

import { useRef, type ReactNode } from "react";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";

export default function GameRow({
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch/pen already scroll natively
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className="flex select-none gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing"
    >
      {games.map((g) => (
        <div key={g.gameUid} className="w-36 shrink-0 sm:w-40">
          <GameCard
            game={g}
            favorited={favorites.has(g.name)}
            onToggleFavorite={() => onToggleFavorite(g)}
            onPlay={() => {
              if (drag.current.moved) return; // don't launch a game right after a drag gesture
              if (g.gameUid) onPlay(g.gameUid);
            }}
            loading={launchingUid === g.gameUid}
          />
        </div>
      ))}
      {trailingTile}
    </div>
  );
}
