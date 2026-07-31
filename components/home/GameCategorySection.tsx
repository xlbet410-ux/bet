"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import { useLang } from "@/lib/language";
import {
  getCatalogPage,
  getSubTagCounts,
  CATEGORY_ACCENT,
  SUB_TAGS,
  type GameCategory,
  type SubTag,
} from "@/lib/games";

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
  icon,
  eyebrow,
  favorites,
  onToggleFavorite,
  launchingUid,
  onPlay,
}: {
  category: GameCategory;
  label: string;
  icon: string;
  eyebrow: string;
  favorites: Map<string, GameItem>;
  onToggleFavorite: (game: GameItem) => void;
  launchingUid: string | null;
  onPlay: (gameUid: string) => void;
}) {
  const { t } = useLang();

  const [games, setGames] = useState<GameItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Each sub-tag only ever has real matches within one category (e.g.
  // table_games/video_poker only within Cards, crash_games/arcade/bingo/
  // scratches only within Mini Games, megaways/jackpot mostly within Slots —
  // see lib/games.ts SUB_TAGS) since that's where Oracle's own raw category
  // for those games already places them. Fetching per-category counts here
  // and only rendering tags with count > 0 means the chip row naturally
  // shows the right tags for whichever section this is, with no per-category
  // special-casing needed.
  const [subTagCounts, setSubTagCounts] = useState<Record<SubTag, number> | null>(null);
  const [activeTag, setActiveTag] = useState<SubTag | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getSubTagCounts(category)
      .then((counts) => {
        if (!cancelled) setSubTagCounts(counts);
      })
      .catch(() => {
        // Non-critical — the chip row just doesn't render if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setPage(1);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const { games: list, total: t } = await getCatalogPage(category, 1, GAMES_PAGE_SIZE, activeTag);
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
  }, [category, activeTag, retryKey]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { games: list } = await getCatalogPage(category, nextPage, GAMES_PAGE_SIZE, activeTag);
      setGames((prev) => [...prev, ...list.map(toGameItem)]);
      setPage(nextPage);
    } catch {
      // transient — the Load More button just stays put and can be retried
    } finally {
      setLoadingMore(false);
    }
  }

  // Nothing in this category and nothing to recover from — don't show an empty section.
  if (!loading && !error && games.length === 0 && !activeTag) return null;

  const accent = CATEGORY_ACCENT[category];
  const subTagLabels: Record<SubTag, string> = {
    megaways: t.subTagMegaways,
    jackpot: t.subTagJackpot,
    table_games: t.subTagTableGames,
    video_poker: t.subTagVideoPoker,
    crash_games: t.subTagCrashGames,
    arcade: t.subTagArcade,
    bingo: t.subTagBingo,
    scratches: t.subTagScratches,
  };
  const showSubTags = subTagCounts && SUB_TAGS.some((tag) => subTagCounts[tag] > 0);

  return (
    <Reveal>
      <section className="relative z-10 px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={<>{icon} {renderTitle(label, accent.to)}</>}
            barFrom={accent.from}
            barTo={accent.to}
          />

          {showSubTags && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(undefined)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  !activeTag
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
                    : "border border-white/10 text-[#9B8EC4] hover:border-[#7B2FBE]/60 hover:text-white"
                }`}
              >
                {t.subTagAll}
              </button>
              {SUB_TAGS.filter((tag) => subTagCounts![tag] > 0).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    activeTag === tag
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C842] text-[#0A0612]"
                      : "border border-white/10 text-[#9B8EC4] hover:border-[#7B2FBE]/60 hover:text-white"
                  }`}
                >
                  {subTagLabels[tag]} <span className="opacity-70">({subTagCounts![tag]})</span>
                </button>
              ))}
            </div>
          )}

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
          ) : games.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#7B5EA7]">No games match this filter right now.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

                {games.length < total && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    aria-label="Load more games"
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D4AF37]/40 text-[#F5C842] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4AF37]/30 border-t-[#F5C842]" />
                    ) : (
                      <>
                        <span className="text-lg tracking-widest">•••</span>
                        <span className="text-xs font-bold uppercase tracking-wide">More</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}
