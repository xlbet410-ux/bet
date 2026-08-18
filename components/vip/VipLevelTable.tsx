"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import type { VipTier } from "@/lib/vip";

const GROUP_COLOR: Record<string, string> = {
  Newcomer: "#9B8EC4",
  Bronze: "#CD7F32",
  Silver: "#B8C0CC",
  Gold: "#F5C842",
  Platinum: "#B9C4D0",
  Diamond: "#7FD8E0",
};

// groupName itself isn't bilingual (one fixed string from the DB) — this
// mirrors each family's own Bengali level names (e.g. "Bronze I" -> "ব্রোঞ্জ
// I") so the mobile accordion header doesn't switch languages halfway.
const GROUP_NAME_BN: Record<string, string> = {
  Newcomer: "নতুন",
  Bronze: "ব্রোঞ্জ",
  Silver: "সিলভার",
  Gold: "গোল্ড",
  Platinum: "প্লাটিনাম",
  Diamond: "ডায়মন্ড",
};

type TableStrings = {
  level: string;
  deposit: string;
  bet: string;
  bonus: string;
  wager: string;
  validity: string;
  signup: string;
  commission: string;
  cashback: string;
  days: string;
  youAreHere: string;
  levelsLabel: (lo: number, hi: number) => string;
};

function money(v: string) {
  return `৳${Math.round(Number(v)).toLocaleString()}`;
}

// Stored as a fraction (0.003 = 0.3%) — multiplied by 100 and trimmed of
// trailing zeros/float artifacts, matching exactly how the CRM's own VIP
// tier edit form displays and edits these same fields.
function pct(v: string) {
  const n = Math.round(Number(v) * 100 * 100) / 100;
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/0$/, "")}%`;
}

function wager(v: string) {
  const n = Number(v);
  return `${n % 1 === 0 ? n.toFixed(0) : n}x`;
}

function groupTiers(tiers: VipTier[]) {
  const groups: { name: string; tiers: VipTier[] }[] = [];
  for (const t of tiers) {
    const last = groups[groups.length - 1];
    if (last && last.name === t.groupName) last.tiers.push(t);
    else groups.push({ name: t.groupName, tiers: [t] });
  }
  return groups;
}

export function VipLevelTable({
  tiers,
  lang,
  currentLevel,
}: {
  tiers: VipTier[];
  lang: string;
  currentLevel?: number;
}) {
  const strings =
    lang === "bn"
      ? {
          level: "লেভেল",
          deposit: "প্রয়োজনীয় ডিপোজিট",
          bet: "প্রয়োজনীয় বেট",
          bonus: "লেভেল-আপ বোনাস",
          wager: "ওয়েজার",
          validity: "মেয়াদ",
          signup: "রেফারেল সাইনআপ বোনাস",
          commission: "বেট কমিশন T1 / T2 / T3",
          cashback: "দৈনিক ক্যাশব্যাক",
          days: "দিন",
          youAreHere: "আপনি এখানে",
          levelsLabel: (lo: number, hi: number) => (lo === hi ? `Lv ${lo}` : `Lv ${lo}–${hi}`),
        }
      : {
          level: "Level",
          deposit: "Required Deposit",
          bet: "Required Bet",
          bonus: "Level-up Bonus",
          wager: "Wager",
          validity: "Validity",
          signup: "Referral Signup Bonus",
          commission: "Bet Commission T1 / T2 / T3",
          cashback: "Daily Cashback",
          days: "days",
          youAreHere: "You are here",
          levelsLabel: (lo: number, hi: number) => (lo === hi ? `Lv ${lo}` : `Lv ${lo}–${hi}`),
        };

  const groups = groupTiers(tiers);
  const currentGroupName = currentLevel !== undefined ? tiers.find((t) => t.level === currentLevel)?.groupName : undefined;

  return (
    <div>
      {/* Desktop / tablet — sticky-header, sticky-first-column table */}
      <div className="hidden overflow-auto rounded-2xl border lg:block" style={{ borderColor: "rgba(255,255,255,.08)", maxHeight: "80vh" }}>
        <table className="w-full min-w-[1020px] border-collapse text-sm">
          <thead>
            <tr>
              {[strings.level, strings.deposit, strings.bet, strings.bonus, strings.wager, strings.validity, strings.signup, strings.commission, strings.cashback].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`sticky top-0 z-10 whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9B8EC4] ${
                      i === 0 ? "left-0 z-20 text-left" : "text-right"
                    }`}
                    style={{ background: "#150a2b", borderBottom: "1px solid rgba(255,255,255,.08)" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {tiers.map((t, i) => {
              const isCurrent = t.level === currentLevel;
              const isGroupStart = i === 0 || tiers[i - 1].groupName !== t.groupName;
              const name = lang === "bn" ? t.nameBn : t.nameEn;
              return (
                <tr
                  key={t.level}
                  style={{
                    borderTop: isGroupStart ? "2px solid rgba(255,255,255,.1)" : "1px solid rgba(255,255,255,.05)",
                    background: isCurrent ? "rgba(212,175,55,.08)" : i % 2 === 1 ? "rgba(255,255,255,.015)" : undefined,
                  }}
                >
                  <td
                    className="sticky left-0 z-10 whitespace-nowrap px-3 py-2.5 text-left"
                    style={{
                      background: isCurrent ? "#241338" : "#170b30",
                      borderLeft: isCurrent ? "3px solid #F5C842" : "3px solid transparent",
                    }}
                  >
                    <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: GROUP_COLOR[t.groupName] }} />
                    <span className="font-bold text-[#F5C842]">Lv {t.level}</span>{" "}
                    <span className="font-semibold text-white">{name}</span>
                    {isCurrent && (
                      <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-[#0A0612]" style={{ background: "#F5C842" }}>
                        {strings.youAreHere}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">{money(t.requiredDeposit)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">{money(t.requiredBet)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-semibold text-[#F5C842]">{money(t.bonusAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">{wager(t.turnoverMultiplier)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">
                    {t.bonusValidityDays !== null ? `${t.bonusValidityDays} ${strings.days}` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">{money(t.referralSignupBonus)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">
                    {pct(t.referralBetCommissionPct)} / {pct(t.referralBetCommissionPctTier2)} / {pct(t.referralBetCommissionPctTier3)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[#E8DFF5]">{pct(t.dailyCashbackPct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile — accordion per tier family, one card per level inside */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {groups.map((g) => (
          <GroupAccordion
            key={g.name}
            group={g}
            lang={lang}
            currentLevel={currentLevel}
            defaultOpen={g.name === currentGroupName}
            strings={strings}
          />
        ))}
      </div>
    </div>
  );
}

function GroupAccordion({
  group,
  lang,
  currentLevel,
  defaultOpen,
  strings,
}: {
  group: { name: string; tiers: VipTier[] };
  lang: string;
  currentLevel?: number;
  defaultOpen: boolean;
  strings: TableStrings;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const lo = group.tiers[0].level;
  const hi = group.tiers[group.tiers.length - 1].level;

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: "linear-gradient(145deg,rgba(27,8,56,.65),rgba(10,6,18,.85))", border: "1px solid rgba(255,255,255,.07)" }}>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3.5">
        <span className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLOR[group.name] }} />
          <span className="font-bold text-white">{lang === "bn" ? GROUP_NAME_BN[group.name] ?? group.name : group.name}</span>
          <span className="text-xs text-[#9B8EC4]">{strings.levelsLabel(lo, hi)}</span>
        </span>
        <FaChevronDown className={`h-3 w-3 text-[#9B8EC4] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-3 pb-3">
          {group.tiers.map((t) => {
            const isCurrent = t.level === currentLevel;
            const name = lang === "bn" ? t.nameBn : t.nameEn;
            return (
              <div
                key={t.level}
                className="rounded-xl p-3"
                style={{
                  background: isCurrent ? "rgba(212,175,55,.1)" : "rgba(255,255,255,.03)",
                  border: isCurrent ? "1px solid rgba(245,200,66,.4)" : "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-white">
                    <span className="text-[#F5C842]">Lv {t.level}</span> {name}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-[#0A0612]" style={{ background: "#F5C842" }}>
                      {strings.youAreHere}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <Field label={strings.deposit} value={money(t.requiredDeposit)} />
                  <Field label={strings.bet} value={money(t.requiredBet)} />
                  <Field label={strings.bonus} value={money(t.bonusAmount)} highlight />
                  <Field label={strings.wager} value={wager(t.turnoverMultiplier)} />
                  <Field label={strings.validity} value={t.bonusValidityDays !== null ? `${t.bonusValidityDays} ${strings.days}` : "—"} />
                  <Field label={strings.signup} value={money(t.referralSignupBonus)} />
                  <Field
                    label={strings.commission}
                    value={`${pct(t.referralBetCommissionPct)} / ${pct(t.referralBetCommissionPctTier2)} / ${pct(t.referralBetCommissionPctTier3)}`}
                  />
                  <Field label={strings.cashback} value={pct(t.dailyCashbackPct)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[#7B5EA7]">{label}</p>
      <p className={`tabular-nums ${highlight ? "font-bold text-[#F5C842]" : "text-[#E8DFF5]"}`}>{value}</p>
    </div>
  );
}
