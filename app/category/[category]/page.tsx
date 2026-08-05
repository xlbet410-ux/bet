"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { FaHeart, FaMagnifyingGlass } from "react-icons/fa6";
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
  CATEGORY_ORDER,
  CATEGORY_ICONS,
  type CategoryProvider,
  type GameCategory,
  type ProviderSort,
} from "@/lib/games";
import type { GameItem } from "@/lib/data";

const PAGE_SIZE = 24;

function toGameItem(g: { name: string; providerName: string; providerCode: string; thumbnail: string; original: string; gameUid: string }): GameItem {
  return {
    name: g.name,
    provider: g.providerName,
    providerCode: g.providerCode,
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

  const router = useRouter();
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Map<string, GameItem>>(new Map());

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

  const toggleFavorite = useCallback((game: GameItem) => {
    setFavorites((prev) => {
      const next = new Map(prev);
      if (next.has(game.name)) next.delete(game.name);
      else next.set(game.name, game);
      return next;
    });
  }, []);

  const handlePlay = useCallback(
    (gameUid: string) => {
      if (!user) {
        setAuthMode("login");
        return;
      }
      router.push(`/play/${gameUid}`);
    },
    [user, router]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = showFavoritesOnly ? games.filter((g) => favorites.has(g.name)) : games;
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));
    return list;
  }, [games, query, showFavoritesOnly, favorites]);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <main className="relative z-10 min-h-screen px-3 pb-20 pt-20 sm:px-5 sm:pb-24 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          {/* category cards — same card design as the homepage hero nav, switch
              section without leaving this page layout */}
          <div
            className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:mb-6 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-8"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORY_ORDER.map((c) => (
              <Link
                key={c}
                href={`/category/${c}`}
                className={`flex w-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-center backdrop-blur-sm transition-all sm:w-auto sm:py-4 ${
                  c === category
                    ? "border-[#D4AF37]/60 bg-[#D4AF37]/15"
                    : "border-white/5 bg-white/[0.03] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5"
                }`}
              >
                <span className="text-xl sm:text-2xl">{CATEGORY_ICONS[c]}</span>
                <span className={`text-[10px] font-semibold sm:text-xs ${c === category ? "text-[#F5C842]" : "text-[#C9B8E8]"}`}>
                  {t.categoryLabels[c]}
                </span>
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
              <h1 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-white sm:mb-4 sm:text-2xl">
                <span>{CATEGORY_ICONS[category]}</span>
                {t.categoryLabels[category]}
              </h1>

              {/* toolbar — search, favorites, sort; same icon-button language as
                  each homepage section's own toolbar, shown at every breakpoint */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowFavoritesOnly((v) => !v)}
                  aria-label="Favorites"
                  aria-pressed={showFavoritesOnly}
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    showFavoritesOnly
                      ? "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#F5C842]"
                      : "border-white/10 bg-white/[0.03] text-[#9B8EC4] hover:border-[#D4AF37]/50 hover:text-[#F5C842]"
                  }`}
                >
                  <FaHeart />
                  {favorites.size > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-black text-[#0A0612]">
                      {favorites.size}
                    </span>
                  )}
                </button>

                <div className="relative min-w-0 flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === "bn" ? "অনুসন্ধান" : "Search games"}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-4 pr-10 text-sm text-white placeholder-[#7B5EA7] outline-none transition-colors focus:border-[#D4AF37]/60"
                  />
                  <FaMagnifyingGlass className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B5EA7]" />
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ProviderSort)}
                  className="shrink-0 rounded-xl border border-white/10 bg-[#160A2E] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/60"
                >
                  <option value="name_asc">{lang === "bn" ? "নাম A-Z" : "Name A-Z"}</option>
                  <option value="name_desc">{lang === "bn" ? "নাম Z-A" : "Name Z-A"}</option>
                  <option value="featured">{lang === "bn" ? "ফিচার্ড আগে" : "Featured first"}</option>
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
                  {showFavoritesOnly
                    ? lang === "bn"
                      ? "আপনার এখনো কোনো প্রিয় গেম নেই।"
                      : "You haven't favorited any games yet."
                    : lang === "bn"
                      ? "কোনো গেম মেলেনি।"
                      : "No games match your search."}
                </p>
              ) : (
                <>
                  <GameGrid
                    games={filtered}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onPlay={handlePlay}
                    launchingUid={null}
                  />
                  {games.length < total && !query && !showFavoritesOnly && (
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
