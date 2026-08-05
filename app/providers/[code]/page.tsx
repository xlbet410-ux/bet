"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBottomNav from "@/components/site/MobileBottomNav";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import GameGrid from "@/components/home/GameGrid";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { getAllProviders, getProviderCatalog, type CategoryProvider, type ProviderSort } from "@/lib/games";
import type { GameItem } from "@/lib/data";

const PAGE_SIZE = 20;

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

export default function ProviderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [providers, setProviders] = useState<CategoryProvider[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [providerName, setProviderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<ProviderSort>("name_asc");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Map<string, GameItem>>(new Map());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    getAllProviders()
      .then((list) => {
        if (!cancelled) setProviders(list);
      })
      .catch(() => {
        // sidebar is non-critical — the page still works without it
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setVisibleCount(PAGE_SIZE);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const { games: list, providerName: name } = await getProviderCatalog(code, 1, 300, sort);
          if (!cancelled) {
            setGames(list.map(toGameItem));
            setProviderName(name);
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
        setError(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code, sort]);

  const toggleFavorite = (game: GameItem) =>
    setFavorites((prev) => {
      const next = new Map(prev);
      if (next.has(game.name)) next.delete(game.name);
      else next.set(game.name, game);
      return next;
    });

  function handlePlay(gameUid: string) {
    if (!user) {
      setAuthMode("login");
      return;
    }
    router.push(`/play/${gameUid}`);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.name.toLowerCase().includes(q));
  }, [games, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      <main className="relative z-10 min-h-screen px-4 pb-24 pt-24 sm:px-5 lg:pt-28">
        <div className="mx-auto flex max-w-7xl gap-6">
          {/* sidebar — every provider, current one highlighted */}
          <aside className="hidden w-56 shrink-0 md:block">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-widest text-[#7B5EA7]">
              {lang === "bn" ? "প্রোভাইডার" : "Providers"}
            </p>
            <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto pr-2">
              {providers.map((p) => (
                <Link
                  key={p.code}
                  href={`/providers/${p.code}`}
                  className={`flex items-center justify-between gap-2 truncate rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    p.code.toUpperCase() === code.toUpperCase()
                      ? "bg-[#D4AF37]/15 text-[#F5C842]"
                      : "text-[#C9B8E8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-[10px] text-[#7B5EA7]">{p.count}</span>
                </Link>
              ))}
            </div>
          </aside>

          {/* main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-white">{providerName || code}</h1>
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
                value={code}
                onChange={(e) => {
                  window.location.href = `/providers/${e.target.value}`;
                }}
                className="w-full rounded-xl border border-white/10 bg-[#160A2E] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/60"
              >
                {providers.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.count})
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : error ? (
              <p className="py-10 text-center text-sm text-[#7B5EA7]">
                {lang === "bn" ? "এই প্রোভাইডারের গেম লোড করা যায়নি।" : "Couldn't load this provider's games right now."}
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#7B5EA7]">
                {lang === "bn" ? "কোনো গেম মেলেনি।" : "No games match your search."}
              </p>
            ) : (
              <>
                <GameGrid
                  games={visible}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onPlay={handlePlay}
                  launchingUid={null}
                />
                {visibleCount < filtered.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="rounded-full border border-[#D4AF37]/60 px-6 py-2.5 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
                    >
                      {lang === "bn" ? "আরও দেখুন" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav onOpenAuth={(m) => setAuthMode(m)} />
    </>
  );
}
