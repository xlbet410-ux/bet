"use client";

import { useCallback, useRef } from "react";
import type { ReactNode } from "react";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";

// A horizontally scrollable row, draggable with the mouse (native touch
// scroll handles it on mobile) — used for the top "quick browse" strip of a
// category section. Distinct from GameGrid, which wraps into normal rows and
// is not scrollable.
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
    // Capturing here (before any real movement) redirects pointerup/click to
    // this element for every mouse interaction, including a plain click —
    // that silently breaks clicking game cards and the trailing "More" tile.
    // Capture is instead acquired lazily in onPointerMove, only once an
    // actual drag is detected, so a non-drag click passes through normally.
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > 3) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScrollLeft - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  }

  // One stable function shared by every card in the row (instead of a fresh
  // closure per card per render) — required for GameCard's memo() to skip
  // re-rendering cards untouched by whatever caused this row to re-render.
  const handlePlay = useCallback(
    (gameUid: string) => {
      if (drag.current.moved) return; // don't launch a game right after a drag gesture
      onPlay(gameUid);
    },
    [onPlay]
  );

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className="flex select-none gap-2 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing sm:gap-3 md:gap-4"
    >
      {games.map((g) => (
        <div key={g.gameUid} className="w-24 shrink-0 sm:w-36 md:w-40">
          <GameCard
            game={g}
            favorited={favorites.has(g.name)}
            onToggleFavorite={onToggleFavorite}
            onPlay={handlePlay}
            loading={launchingUid === g.gameUid}
          />
        </div>
      ))}
      {trailingTile && <div className="w-24 shrink-0 sm:w-36 md:w-40">{trailingTile}</div>}
    </div>
  );
}
