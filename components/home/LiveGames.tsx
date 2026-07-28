"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import {
  getProviders,
  getProviderGames,
  launchGame,
  categorizeProvider,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type GameProvider,
  type GameCategory,
} from "@/lib/games";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";

export default function LiveGames({ onOpenAuth }: { onOpenAuth: (mode: "login" | "register") => void }) {
  const { user } = useAuth();
  const { t } = useLang();

  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState(false);
  const [providersRetryKey, setProvidersRetryKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState<GameCategory | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [games, setGames] = useState<GameItem[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState(false);
  const [gamesRetryKey, setGamesRetryKey] = useState(0);
  const [launchingUid, setLaunchingUid] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // The provider API can be briefly unready right after a fresh page load
  // (cold backend, slow first connection). Retry a few times with backoff
  // before giving up, instead of silently rendering nothing.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProvidersLoading(true);
      setProvidersError(false);
      const maxAttempts = 4;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getProviders();
          if (!cancelled) {
            setProviders(list);
            setProvidersLoading(false);
          }
          return;
        } catch {
          if (attempt === maxAttempts) break;
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
      if (!cancelled) {
        setProvidersError(true);
        setProvidersLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [providersRetryKey]);

  const byCategory = useMemo(() => {
    const groups: Record<GameCategory, GameProvider[]> = {
      slots: [],
      "live-casino": [],
      sports: [],
      esports: [],
      other: [],
    };
    for (const p of providers) groups[categorizeProvider(p.name)].push(p);
    return groups;
  }, [providers]);

  const availableCategories = CATEGORY_ORDER.filter((c) => byCategory[c].length > 0);

  // default to the first non-empty category once providers load
  useEffect(() => {
    if (activeCategory || availableCategories.length === 0) return;
    setActiveCategory(availableCategories[0]);
  }, [availableCategories, activeCategory]);

  // default to the first provider whenever the active category changes
  useEffect(() => {
    if (!activeCategory) return;
    const first = byCategory[activeCategory][0];
    setActiveCode(first ? first.code : null);
  }, [activeCategory, byCategory]);

  useEffect(() => {
    if (!activeCode) {
      setGames([]);
      setGamesLoading(false);
      setGamesError(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setGamesLoading(true);
      setGamesError(false);
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const list = await getProviderGames(activeCode as string);
          if (!cancelled) {
            setGames(
              list.map((g) => ({
                name: g.name,
                provider: activeCode as string,
                img: g.thumbnail || g.original,
                glow: "#D4AF37",
                gameUid: g.game_uid,
              }))
            );
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
        setGamesError(true);
        setGamesLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeCode, gamesRetryKey]);

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

  // Genuinely no providers configured (successful fetch, empty result) —
  // nothing to show and no error to recover from.
  if (!providersLoading && !providersError && providers.length === 0) return null;

  return (
    <section className="relative z-10 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.recommend}
          title={<>Live <span className="text-[#F5C842]">Games</span></>}
          barFrom="#D4AF37"
          barTo="#F5C842"
        />

        {providersLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        )}

        {providersError && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load games right now.</p>
            <button
              onClick={() => setProvidersRetryKey((k) => k + 1)}
              className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
            >
              Retry
            </button>
          </div>
        )}

        {!providersLoading && !providersError && (
          <>
            {/* category tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {availableCategories.map((c) => (
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
                  <span className="ml-1.5 opacity-70">({byCategory[c].length})</span>
                </button>
              ))}
            </div>

            {/* provider chips within the active category */}
            {activeCategory && (
              <div className="mb-6 flex flex-wrap gap-2">
                {byCategory[activeCategory].map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setActiveCode(p.code)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                      activeCode === p.code
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5C842]"
                        : "border-white/10 text-[#9B8EC4] hover:border-[#7B2FBE]/60 hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

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
                <p className="text-sm text-[#7B5EA7]">Couldn&apos;t load games for this provider.</p>
                <button
                  onClick={() => setGamesRetryKey((k) => k + 1)}
                  className="rounded-full border border-[#D4AF37]/60 px-5 py-2 text-sm font-bold text-[#F5C842] transition-colors hover:bg-[#D4AF37]/10"
                >
                  Retry
                </button>
              </div>
            ) : games.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#7B5EA7]">No games available for this provider right now.</p>
            ) : (
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
            )}
          </>
        )}
      </div>
    </section>
  );
}
