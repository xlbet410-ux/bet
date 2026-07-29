"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import { getCatalogPage, CATEGORY_ACCENT, type GameCategory } from "@/lib/games";

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

// Colors only the last word of the label (e.g. "Live Games" -> "Live" + gold "Games"),
// matching the two-tone section-title treatment used across the homepage.
function renderTitle(label: string, color: string) {
  const words = label.split(" ");
  const last = words.pop();
  const prefix = words.join(" ");
  return (
    <>
      {prefix ? `${prefix} ` : ""}
      <span style={{ color }}>{last}</span>
    </>
  );
}

export default function GameCategorySection({
  category,
  label,
  eyebrow,
  favorites,
  onToggleFavorite,
  launchingUid,
  onPlay,
}: {
  category: GameCategory;
  label: string;
  eyebrow: string;
  favorites: Set<string>;
  onToggleFavorite: (name: string) => void;
  launchingUid: string | null;
  onPlay: (gameUid: string) => void;
}) {
  const [games, setGames] = useState<GameItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setPage(1);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const { games: list, total: t } = await getCatalogPage(category, 1, GAMES_PAGE_SIZE);
          if (!cancelled) {
            setGames(list.map(toGameItem));
            setTotal(t);
            setLoading(false);
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
        setError(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, retryKey]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { games: list } = await getCatalogPage(category, nextPage, GAMES_PAGE_SIZE);
      setGames((prev) => [...prev, ...list.map(toGameItem)]);
      setPage(nextPage);
    } catch {
      // transient — the Load More button just stays put and can be retried
    } finally {
      setLoadingMore(false);
    }
  }

  // Nothing in this category and nothing to recover from — don't show an empty section.
  if (!loading && !error && games.length === 0) return null;

  const accent = CATEGORY_ACCENT[category];

  return (
    <Reveal>
      <section className="relative z-10 px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={renderTitle(label, accent.to)}
            barFrom={accent.from}
            barTo={accent.to}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load {label.toLowerCase()} right now.</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {games.map((g) => (
                  <GameCard
                    key={g.gameUid}
                    game={g}
                    favorited={favorites.has(g.name)}
                    onToggleFavorite={() => onToggleFavorite(g.name)}
                    onPlay={() => g.gameUid && onPlay(g.gameUid)}
                    loading={launchingUid === g.gameUid}
                  />
                ))}
              </div>

              {games.length < total && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : `Load More (${total - games.length} more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}
