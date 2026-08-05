"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import GameGrid from "@/components/home/GameGrid";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import {
  getCatalogPage,
  getCategoryProviders,
  launchGame,
  CATEGORY_ORDER,
  CATEGORY_ICONS,
  type CategoryProvider,
  type GameCategory,
  type ProviderSort,
} from "@/lib/games";
import type { GameItem } from "@/lib/data";

const PAGE_SIZE = 24;

function toGameItem(g: { name: string; providerName: string; thumbnail: string; original: string; gameUid: string }): GameItem {
  return {
    name: g.name,
    provider: g.providerName,
    img: g.thumbnail || g.original,
    glow: "#D4AF37",
    gameUid: g.gameUid,
  };
}

function isGameCategory(value: string): value is GameCategory {
  return (CATEGORY_ORDER as string[]).includes(value);
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = use(params);
  if (!isGameCategory(rawCategory)) notFound();
  const category = rawCategory;

  const { user } = useAuth();
  const { t, lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [providers, setProviders] = useState<CategoryProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [games, setGames] = useState<GameItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<ProviderSort>("name_asc");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Map<string, GameItem>>(new Map());
  const [launchingUid, setLaunchingUid] = useState<string | null>(null);

  // Reset the provider filter when the category itself changes (a provider
  // from the old category's sidebar makes no sense once we've navigated
  // away) — adjusted during render rather than in an effect, per React's own
  // guidance for state that depends on a changed prop.
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setPrevCategory(category);
    setActiveProvider(null);
  }

  useEffect(() => {
    let cancelled = false;
    getCategoryProviders(category)
      .then((list) => {
        if (!cancelled) setProviders(list);
      })
      .catch(() => {
        // sidebar is non-critical — the page still works without it
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
          const { games: list, total: t } = await getCatalogPage(
            category,
            1,
            PAGE_SIZE,
            undefined,
            activeProvider ?? undefined,
            sort
          );
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
  }, [category, activeProvider, sort]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { games: list } = await getCatalogPage(
        category,
        nextPage,
        PAGE_SIZE,
        undefined,
        activeProvider ?? undefined,
        sort
      );
      setGames((prev) => [...prev, ...list.map(toGameItem)]);
      setPage(nextPage);
    } catch {
      // transient — the Load More button just stays put and can be retried
    } finally {
      setLoadingMore(false);
    }
  }

  const toggleFavorite = (game: GameItem) =>
    setFavorites((prev) => {
      const next = new Map(prev);
      if (next.has(game.name)) next.delete(game.name);
      else next.set(game.name, game);
      return next;
    });

  async function handlePlay(gameUid: string) {
    if (!user) {
      setAuthMode("login");
      return;
    }
    setLaunchingUid(gameUid);
    try {
      const { gameUrl } = await launchGame(gameUid);
      window.open(gameUrl, "_blank", "noopener,noreferrer");
    } catch {
      // transient — user can just click Play again
    } finally {
      setLaunchingUid(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.name.toLowerCase().includes(q));
  }, [games, query]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <main className="relative z-10 min-h-screen px-3 pb-24 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          {/* category tabs — switch section without leaving this page layout */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_ORDER.map((c) => (
              <Link
                key={c}
                href={`/category/${c}`}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  c === category
                    ? "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#F5C842]"
                    : "border-white/10 bg-white/[0.03] text-[#C9B8E8] hover:border-[#D4AF37]/40 hover:text-white"
                }`}
              >
                <span>{CATEGORY_ICONS[c]}</span>
                {t.categoryLabels[c]}
              </Link>
            ))}
          </div>

          <div className="flex gap-6">
            {/* sidebar — providers within this category, current one highlighted */}
            <aside className="hidden w-56 shrink-0 md:block">
              <p className="mb-3 px-1 text-xs font-black uppercase tracking-widest text-[#7B5EA7]">
                {lang === "bn" ? "প্রোভাইডার" : "Providers"}
              </p>
              <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-2">
                <button
                  onClick={() => setActiveProvider(null)}
                  className={`flex items-center justify-between gap-2 truncate rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    !activeProvider
                      ? "bg-[#D4AF37]/15 text-[#F5C842]"
                      : "text-[#C9B8E8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {lang === "bn" ? "সব প্রোভাইডার" : "All providers"}
                </button>
                {providers.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setActiveProvider(p.code)}
                    className={`flex items-center justify-between gap-2 truncate rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeProvider === p.code
                        ? "bg-[#D4AF37]/15 text-[#F5C842]"
                        : "text-[#C9B8E8] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-[10px] text-[#7B5EA7]">{p.count}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* main content */}
            <div className="min-w-0 flex-1">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
                  <span>{CATEGORY_ICONS[category]}</span>
                  {t.categoryLabels[category]}
                </h1>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === "bn" ? "অনুসন্ধান" : "Search games"}
                    className="w-40 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder-[#7B5EA7] outline-none transition-colors focus:border-[#D4AF37]/60 sm:w-56"
                  />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ProviderSort)}
                    className="rounded-xl border border-white/10 bg-[#160A2E] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/60"
                  >
                    <option value="name_asc">{lang === "bn" ? "নাম A-Z" : "Name A-Z"}</option>
                    <option value="name_desc">{lang === "bn" ? "নাম Z-A" : "Name Z-A"}</option>
                    <option value="featured">{lang === "bn" ? "ফিচার্ড আগে" : "Featured first"}</option>
                  </select>
                </div>
              </div>

              {/* provider switcher for narrow screens (no sidebar there) */}
              <div className="mb-4 md:hidden">
                <select
                  value={activeProvider ?? ""}
                  onChange={(e) => setActiveProvider(e.target.value || null)}
                  className="w-full rounded-xl border border-white/10 bg-[#160A2E] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/60"
                >
                  <option value="">{lang === "bn" ? "সব প্রোভাইডার" : "All providers"}</option>
                  {providers.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.count})
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-4/5 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : error ? (
                <p className="py-10 text-center text-sm text-[#7B5EA7]">
                  {lang === "bn" ? "গেম লোড করা যায়নি।" : "Couldn't load these games right now."}
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#7B5EA7]">
                  {lang === "bn" ? "কোনো গেম মেলেনি।" : "No games match your search."}
                </p>
              ) : (
                <>
                  <GameGrid
                    games={filtered}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onPlay={handlePlay}
                    launchingUid={launchingUid}
                  />
                  {games.length < total && !query && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-50"
                      >
                        {loadingMore
                          ? lang === "bn"
                            ? "লোড হচ্ছে…"
                            : "Loading…"
                          : lang === "bn"
                            ? "আরও দেখুন"
                            : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
