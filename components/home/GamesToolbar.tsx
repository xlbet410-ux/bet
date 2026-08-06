"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaTableCells, FaFire, FaHeart, FaMagnifyingGlass } from "react-icons/fa6";
import { searchCatalog, type CatalogGame } from "@/lib/games";
import { useLang } from "@/lib/language";

export default function GamesToolbar({
  hasFeatured,
  favoritesCount,
  showingFavorites,
  onToggleFavoritesView,
  onJumpToAll,
  onJumpToFeatured,
  onPlay,
  stacked = false,
}: {
  hasFeatured: boolean;
  favoritesCount: number;
  showingFavorites: boolean;
  onToggleFavoritesView: () => void;
  onJumpToAll: () => void;
  onJumpToFeatured: () => void;
  onPlay: (gameUid: string) => void;
  // Compact mobile treatment: icons centered on their own row, search full-width below.
  stacked?: boolean;
}) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogGame[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();

    // AbortController actually cancels the in-flight request on fast
    // typing, instead of just discarding its result client-side — avoids
    // piling up stale requests against the backend while a user is typing.
    const controller = new AbortController();

    async function run() {
      if (q.length < 2) {
        setResults([]);
        setOpen(false);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const { games } = await searchCatalog(q, controller.signal);
        setResults(games);
        setOpen(true);
        setSearching(false);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setResults([]);
        setSearching(false);
      }
    }

    const timer = setTimeout(run, q.length < 2 ? 0 : 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(game: CatalogGame) {
    setOpen(false);
    setQuery("");
    onPlay(game.gameUid);
  }

  return (
    <div
      // isolate traps this toolbar's own z-index layers (including the
      // search dropdown below) in their own stacking context — with ~18 of
      // these rendered on the homepage at once, this stops any one
      // instance's dropdown from competing against another's internal
      // layers just because of paint order.
      className={`relative isolate z-10 flex gap-2 ${
        stacked ? "flex-col items-stretch" : "flex-wrap items-center justify-end"
      }`}
    >
      <div className={`flex items-center gap-2 ${stacked ? "justify-center" : ""}`}>
        <button
          onClick={onJumpToAll}
          aria-label="All games"
          title="All games"
          className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#9B8EC4] transition-colors hover:border-[#D4AF37]/50 hover:text-[#F5C842] ${
            stacked ? "h-9 w-9" : "h-10 w-10"
          }`}
        >
          <FaTableCells />
        </button>

        {hasFeatured && (
          <button
            onClick={onJumpToFeatured}
            aria-label="Featured games"
            title="Featured games"
            className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#9B8EC4] transition-colors hover:border-[#D4AF37]/50 hover:text-[#F5C842] ${
              stacked ? "h-9 w-9" : "h-10 w-10"
            }`}
          >
            <FaFire />
          </button>
        )}

        <button
          onClick={onToggleFavoritesView}
          aria-label="Favorites"
          title="Favorites"
          aria-pressed={showingFavorites}
          className={`relative flex items-center justify-center rounded-xl border transition-colors ${
            stacked ? "h-9 w-9" : "h-10 w-10"
          } ${
            showingFavorites
              ? "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#F5C842]"
              : "border-white/10 bg-white/[0.03] text-[#9B8EC4] hover:border-[#D4AF37]/50 hover:text-[#F5C842]"
          }`}
        >
          <FaHeart />
          {favoritesCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-black text-[#0A0612]">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

      <div ref={wrapperRef} className={`relative ${stacked ? "w-full" : "w-full sm:w-64"}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={t.subTagAll === "সব" ? "অনুসন্ধান" : "Search"}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-4 pr-10 text-sm text-white placeholder-[#7B5EA7] outline-none transition-colors focus:border-[#D4AF37]/60"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7B5EA7]">
          {searching ? (
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7B5EA7]/40 border-t-[#F5C842]" />
          ) : (
            <FaMagnifyingGlass className="h-3.5 w-3.5" />
          )}
        </span>

        {open && results.length > 0 && (
          <div
            // On mobile this opens the on-screen keyboard, which covers the
            // bottom of the viewport — showing the dropdown above the input
            // instead of below keeps it clear of the keyboard no matter
            // where on the page this toolbar sits.
            className={`absolute right-0 z-50 max-h-96 w-full min-w-[280px] overflow-y-auto rounded-xl border border-white/10 bg-[#160A2E] shadow-2xl ${
              stacked ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {results.map((g) => (
              <button
                key={g.gameUid}
                onClick={() => pick(g)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={g.thumbnail || g.original}
                    alt={g.name}
                    fill
                    unoptimized
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{g.name}</p>
                  <p className="truncate text-xs text-[#7B5EA7]">{g.providerName}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {open && results.length === 0 && !searching && query.trim().length >= 2 && (
          <div
            className={`absolute right-0 z-50 w-full rounded-xl border border-white/10 bg-[#160A2E] px-4 py-3 text-center text-sm text-[#7B5EA7] shadow-2xl ${
              stacked ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            No games found.
          </div>
        )}
      </div>
    </div>
  );
}
