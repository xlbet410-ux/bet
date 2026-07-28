"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import {
  getCatalogCounts,
  getCatalogPage,
  launchGame,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type GameCategory,
} from "@/lib/games";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";

const GAMES_PAGE_SIZE = 18;

function toGameItem(g: { name: string; providerName: string; thumbnail: string; original: string; gameUid: string }): GameItem {
  return {
    name: g.name,
    provider: g.providerName,
    img: g.thumbnail || g.original,
    glow: "#D4AF37",
    gameUid: g.gameUid,
  };
}

export default function LiveGames({ onOpenAuth }: { onOpenAuth: (mode: "login" | "register") => void }) {
  const { user } = useAuth();
  const { t } = useLang();

  const [counts, setCounts] = useState<Record<GameCategory, number> | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(false);
  const [countsRetryKey, setCountsRetryKey] = useState(0);

  const [activeCategory, setActiveCategory] = useState<GameCategory | null>(null);

  const [games, setGames] = useState<GameItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesLoadingMore, setGamesLoadingMore] = useState(false);
  const [gamesError, setGamesError] = useState(false);
  const [gamesRetryKey, setGamesRetryKey] = useState(0);

  const [launchingUid, setLaunchingUid] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  // default to the first non-empty category once counts load
  useEffect(() => {
    if (activeCategory || !counts) return;
    const firstNonEmpty = CATEGORY_ORDER.find((c) => counts[c] > 0);
    setActiveCategory(firstNonEmpty ?? CATEGORY_ORDER[0]);
  }, [counts, activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;
    const category = activeCategory;

    let cancelled = false;

    async function load() {
      setGamesLoading(true);
      setGamesError(false);
      setPage(1);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const { games: list, total: t } = await getCatalogPage(category, 1, GAMES_PAGE_SIZE);
          if (!cancelled) {
            setGames(list.map(toGameItem));
            setTotal(t);
            setGamesLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setGames([]);
        setTotal(0);
        setGamesError(true);
        setGamesLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, gamesRetryKey]);

  async function loadMore() {
    if (!activeCategory || gamesLoadingMore) return;
    setGamesLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { games: list } = await getCatalogPage(activeCategory, nextPage, GAMES_PAGE_SIZE);
      setGames((prev) => [...prev, ...list.map(toGameItem)]);
      setPage(nextPage);
    } catch {
      setError("Couldn't load more games right now.");
    } finally {
      setGamesLoadingMore(false);
    }
  }

  const toggleFavorite = (name: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });

  async function handlePlay(gameUid: string) {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    setError("");
    setLaunchingUid(gameUid);
    try {
      const { gameUrl } = await launchGame(gameUid);
      window.open(gameUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't launch this game right now.");
    } finally {
      setLaunchingUid(null);
    }
  }

  // Genuinely no games in the whole catalog (successful fetch, every
  // category empty) — nothing to show and no error to recover from.
  if (!countsLoading && !countsError && counts && Object.values(counts).every((n) => n === 0)) return null;

  return (
    <section className="relative z-10 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.recommend}
          title={<>Live <span className="text-[#F5C842]">Games</span></>}
          barFrom="#D4AF37"
          barTo="#F5C842"
        />

        {countsLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        )}

        {countsError && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load games right now.</p>
            <button
              onClick={() => setCountsRetryKey((k) => k + 1)}
              className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
            >
              Retry
            </button>
          </div>
        )}

        {!countsLoading && !countsError && (
          <>
            {/* category tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                    activeCategory === c
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
                      : "border border-white/10 text-[#9B8EC4] hover:border-[#7B2FBE]/60 hover:text-white"
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                  <span className="ml-1.5 opacity-70">({counts?.[c] ?? 0})</span>
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            {gamesLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : gamesError ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load games for this category.</p>
                <button
                  onClick={() => setGamesRetryKey((k) => k + 1)}
                  className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
                >
                  Retry
                </button>
              </div>
            ) : games.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#7B5EA7]">No games available in this category right now.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {games.map((g) => (
                    <GameCard
                      key={g.gameUid}
                      game={g}
                      favorited={favorites.has(g.name)}
                      onToggleFavorite={() => toggleFavorite(g.name)}
                      onPlay={() => g.gameUid && handlePlay(g.gameUid)}
                      loading={launchingUid === g.gameUid}
                    />
                  ))}
                </div>

                {games.length < total && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={gamesLoadingMore}
                      className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-50"
                    >
                      {gamesLoadingMore ? "Loading…" : `Load More (${total - games.length} more)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
