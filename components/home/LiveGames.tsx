"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GameCard from "./GameCard";
import type { GameItem } from "@/lib/data";
import { getProviders, getProviderGames, launchGame, type GameProvider } from "@/lib/games";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";

export default function LiveGames({ onOpenAuth }: { onOpenAuth: (mode: "login" | "register") => void }) {
  const { user } = useAuth();
  const { t } = useLang();

  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingUid, setLaunchingUid] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    getProviders().then((list) => {
      setProviders(list);
      if (list.length > 0) setActiveCode(list[0].code);
      else setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!activeCode) return;
    setLoading(true);
    getProviderGames(activeCode)
      .then((list) => {
        setGames(
          list.map((g) => ({
            name: g.name,
            provider: activeCode,
            img: g.thumbnail || g.original,
            glow: "#D4AF37",
            gameUid: g.game_uid,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [activeCode]);

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

  if (!loading && providers.length === 0) return null;

  return (
    <section className="relative z-10 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.recommend}
          title={<>Live <span className="text-[#F5C842]">Games</span></>}
          barFrom="#D4AF37"
          barTo="#F5C842"
        />

        {/* provider chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {providers.map((p) => (
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

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
            ))}
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
      </div>
    </section>
  );
}
