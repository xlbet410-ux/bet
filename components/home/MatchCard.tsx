"use client";

import type { Match } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function MatchCard({ match }: { match: Match }) {
  const { t } = useLang();

  const odds = [
    { label: "1", value: match.oddsHome },
    ...(match.oddsDraw !== undefined ? [{ label: "X", value: match.oddsDraw }] : []),
    { label: "2", value: match.oddsAway },
  ];

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: "linear-gradient(145deg, rgba(27,8,56,0.95) 0%, rgba(10,6,18,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
      }}
    >
      {/* hover glow border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `0 0 0 1px ${match.glow}50, 0 4px 32px ${match.glow}18` }}
      />

      {/* accent blob */}
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-25"
        style={{ background: match.glow }}
      />

      {/* thin top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${match.glow}60, transparent)` }}
      />

      <div className="relative p-4">
        {/* league row */}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9B8EC4]">
            <match.sportIcon className="h-3.5 w-3.5" />
            {match.league}
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {t.liveNow} · {match.time}
          </span>
        </div>

        {/* score block */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="mb-2 truncate text-sm font-extrabold tracking-wide text-white">
              {match.home}
            </p>
            <p
              className="text-3xl font-black tabular-nums"
              style={{
                background: "linear-gradient(to bottom, #F5C842, #C8923B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px #D4AF3750)",
              }}
            >
              {match.homeScore}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-3">
            <div
              className="h-px w-10 rounded-full"
              style={{ background: `linear-gradient(to right, transparent, ${match.glow}40, transparent)` }}
            />
            <span
              className="rounded-lg px-2.5 py-1 text-[10px] font-black tracking-widest text-[#7A6E9C]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              VS
            </span>
            <div
              className="h-px w-10 rounded-full"
              style={{ background: `linear-gradient(to right, transparent, ${match.glow}40, transparent)` }}
            />
          </div>

          <div className="flex-1 text-center">
            <p className="mb-2 truncate text-sm font-extrabold tracking-wide text-white">
              {match.away}
            </p>
            <p
              className="text-3xl font-black tabular-nums"
              style={{
                background: "linear-gradient(to bottom, #F5C842, #C8923B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px #D4AF3750)",
              }}
            >
              {match.awayScore}
            </p>
          </div>
        </div>

        {/* odds buttons */}
        <div className={`grid gap-2 ${odds.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {odds.map(({ label, value }) => (
            <button
              key={label}
              className="group/btn relative overflow-hidden rounded-xl py-2.5 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.35)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(212,175,55,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <span className="block text-[10px] font-semibold text-[#7A6E9C]">{label}</span>
              <span className="mt-0.5 block text-sm font-black text-white">{value.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
