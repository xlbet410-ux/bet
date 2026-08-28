"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GameCategorySection from "./GameCategorySection";
import GameGrid from "./GameGrid";
import GamesToolbar from "./GamesToolbar";
import type { GameItem } from "@/lib/data";
import {
  getCatalogCounts,
  openGame,
  CATEGORY_ORDER,
  CATEGORY_ICONS,
  type GameCategory,
} from "@/lib/games";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";

export default function LiveGames({ onOpenAuth }: { onOpenAuth: (mode: "login" | "register") => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();

  const [counts, setCounts] = useState<Record<GameCategory, number> | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(false);
  const [countsRetryKey, setCountsRetryKey] = useState(0);

  const [favorites, setFavorites] = useState<Map<string, GameItem>>(new Map());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  // The catalog API can be briefly unready right after a fresh page load
  // (cold backend, slow first connection). Retry a few times with backoff
  // before giving up, instead of silently rendering nothing.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setCountsLoading(true);
      setCountsError(false);
      const maxAttempts = 4;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const c = await getCatalogCounts();
          if (!cancelled) {
            setCounts(c);
            setCountsLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setCountsError(true);
        setCountsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [countsRetryKey]);

  const toggleFavorite = useCallback((game: GameItem) => {
    setFavorites((prev) => {
      const next = new Map(prev);
      if (next.has(game.name)) next.delete(game.name); else next.set(game.name, game);
      return next;
    });
  }, []);

  const handlePlay = useCallback(
    (gameUid: string) => {
      if (!user) {
        onOpenAuth("login");
        return;
      }
      void openGame(gameUid, router);
    },
    [user, onOpenAuth, router]
  );

  if (countsLoading) {
    return (
      <section className="relative z-10 px-3 py-0.5 sm:px-5 sm:py-1">
        <div className="mx-auto max-w-6xl grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (countsError) {
    return (
      <section className="relative z-10 px-3 py-0.5 sm:px-5 sm:py-1">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
          <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load games right now.</p>
          <button
            onClick={() => setCountsRetryKey((k) => k + 1)}
            className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Genuinely no games in the whole catalog (successful fetch, every category empty).
  if (!counts || Object.values(counts).every((n) => n === 0)) return null;

  const favoritesList = [...favorites.values()];

  const toolbarProps = {
    hasFeatured: counts.featured > 0,
    favoritesCount: favorites.size,
    showingFavorites: showFavoritesOnly,
    onToggleFavoritesView: () => setShowFavoritesOnly((v) => !v),
    onJumpToAll: () => {
      setShowFavoritesOnly(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    onJumpToFeatured: () => {
      setShowFavoritesOnly(false);
      featuredRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    onPlay: handlePlay,
  };

  return (
    <div ref={topRef}>
      {showFavoritesOnly ? (
        <section className="relative z-10 px-3 py-0.5 sm:px-5 sm:py-1">
          <GamesToolbar {...toolbarProps} />
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 mt-6 text-2xl font-extrabold tracking-tight md:text-3xl">
              {t.subTagAll === "সব" ? "প্রিয় গেমস" : "Favorites"}
            </h2>
            {favoritesList.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#7B5EA7]">
                {t.subTagAll === "সব" ? "আপনার এখনো কোনো প্রিয় গেম নেই।" : "You haven't favorited any games yet."}
              </p>
            ) : (
              <GameGrid
                games={favoritesList}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onPlay={handlePlay}
                launchingUid={null}
              />
            )}
          </div>
        </section>
      ) : (
        CATEGORY_ORDER.filter((c) => counts[c] > 0).map((c) => (
          <div key={c} ref={c === "featured" ? featuredRef : undefined}>
            <GameCategorySection
              category={c}
              label={t.categoryLabels[c]}
              icon={CATEGORY_ICONS[c]}
              eyebrow={c === "featured" ? "" : t.recommend}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              launchingUid={null}
              onPlay={handlePlay}
              toolbar={toolbarProps}
            />
          </div>
        ))
      )}
    </div>
  );
}
