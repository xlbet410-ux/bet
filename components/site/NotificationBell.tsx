"use client";

import { useEffect, useRef, useState } from "react";
import { FaBell, FaCircleCheck } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  type AppNotification,
  type NotificationType,
} from "@/lib/notifications";
import { claimOffer } from "@/lib/offers";

const POLL_MS = 30_000;

function amountOf(n: AppNotification) {
  const v = n.metadata?.amount;
  return typeof v === "string" ? Number(v).toLocaleString() : "0";
}

function describe(n: AppNotification, lang: string): string {
  const amount = amountOf(n);
  const md = n.metadata ?? {};
  switch (n.type as NotificationType) {
    case "referral_signup_bonus":
      return lang === "bn"
        ? `${md.referredName ?? "একজন বন্ধু"}-কে রেফার করার জন্য আপনি ৳${amount} বোনাস পেয়েছেন`
        : `You earned ৳${amount} referral bonus for inviting ${md.referredName ?? "a friend"}`;
    case "vip_levelup":
      return lang === "bn"
        ? `অভিনন্দন! আপনি VIP লেভেল ${md.toLevel}-এ উন্নীত হয়েছেন${md.bonusAmount ? ` এবং ৳${Number(md.bonusAmount).toLocaleString()} বোনাস পেয়েছেন` : ""}`
        : `Congrats! You leveled up to VIP ${md.toLevel}${md.bonusAmount ? ` and got a ৳${Number(md.bonusAmount).toLocaleString()} bonus` : ""}`;
    case "daily_cashback":
      return lang === "bn" ? `আপনি ৳${amount} দৈনিক ক্যাশব্যাক পেয়েছেন` : `You received ৳${amount} daily cashback`;
    case "offer_bonus":
      return lang === "bn" ? `আপনি ৳${amount} বোনাস দাবি করেছেন` : `You claimed a ৳${amount} bonus`;
    case "offer_claimable": {
      const title = (lang === "bn" ? md.titleBn : md.titleEn) ?? md.titleBn ?? (lang === "bn" ? "একটি অফার" : "an offer");
      return lang === "bn" ? `আপনি এখন "${title}" দাবি করতে পারবেন` : `You can now claim "${title}"`;
    }
    case "kyc_approved":
      return lang === "bn" ? "আপনার কেওয়াইসি যাচাইকরণ অনুমোদিত হয়েছে" : "Your KYC verification was approved";
    case "kyc_rejected":
      return lang === "bn"
        ? `আপনার কেওয়াইসি যাচাইকরণ প্রত্যাখ্যাত হয়েছে${md.reason ? `: ${md.reason}` : ""}`
        : `Your KYC verification was rejected${md.reason ? `: ${md.reason}` : ""}`;
    case "deposit_approved":
      return lang === "bn" ? `আপনার ৳${amount} জমা অনুমোদিত হয়েছে` : `Your deposit of ৳${amount} was approved`;
    case "withdrawal_approved":
      return lang === "bn" ? `আপনার ৳${amount} উত্তোলন অনুমোদিত হয়েছে` : `Your withdrawal of ৳${amount} was approved`;
    case "withdrawal_rejected":
      return lang === "bn" ? `আপনার ৳${amount} উত্তোলন প্রত্যাখ্যাত হয়েছে` : `Your withdrawal of ৳${amount} was rejected`;
    default:
      return lang === "bn" ? "নতুন নোটিফিকেশন" : "New notification";
  }
}

function timeAgo(iso: string, lang: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return lang === "bn" ? "এইমাত্র" : "just now";
  if (mins < 60) return lang === "bn" ? `${mins} মিনিট আগে` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === "bn" ? `${hrs} ঘণ্টা আগে` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === "bn" ? `${days} দিন আগে` : `${days}d ago`;
}

// Every other notification type is purely descriptive (something already
// happened) — this one is the only actionable kind, so it gets its own
// small bit of local state (claiming/claimed/amount/error) rather than
// threading that through the parent list for every item.
function NotificationItem({ notification: n, lang }: { notification: AppNotification; lang: string }) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [amount, setAmount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const offerSlug = n.type === "offer_claimable" ? (n.metadata?.offerSlug as string | undefined) : undefined;

  async function handleClaim() {
    if (!offerSlug) return;
    setClaiming(true);
    setError(null);
    try {
      const result = await claimOffer(offerSlug);
      setAmount(result.rewardAmount);
      setClaimed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === "bn" ? "কিছু ভুল হয়েছে।" : "Something went wrong."));
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div
      className={`flex items-start gap-2.5 border-b border-white/[0.04] px-4 py-3 last:border-b-0 ${!n.isRead ? "bg-white/[0.03]" : ""}`}
    >
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: n.isRead ? "transparent" : "#F5C842" }} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-[#E5D9FF]">{describe(n, lang)}</p>
        <p className="mt-1 text-[10px] text-[#6A5E8A]">{timeAgo(n.createdAt, lang)}</p>

        {offerSlug && (
          claimed ? (
            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#4ade80]">
              <FaCircleCheck />
              {amount
                ? (lang === "bn" ? `আপনি ৳${Number(amount).toLocaleString()} পেয়েছেন!` : `You received ৳${Number(amount).toLocaleString()}!`)
                : (lang === "bn" ? "দাবি করা হয়েছে" : "Claimed")}
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="mt-2 rounded-full px-3 py-1 text-[11px] font-bold text-[#1A1A1A] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "#F5C842" }}
              >
                {claiming ? "…" : lang === "bn" ? "এখনই দাবি করুন" : "Claim Now"}
              </button>
              {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function poll() {
      try {
        const { count } = await getUnreadNotificationCount();
        if (!cancelled) setUnread(count);
      } catch {}
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user?.id]);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (!next || !user) return;
    setLoading(true);
    try {
      const page = await getMyNotifications(1);
      setItems(page.notifications);
      if (page.unreadCount > 0) {
        await markAllNotificationsRead();
        setUnread(0);
      }
    } catch {
      // Non-critical — panel just stays empty/stale until next open.
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        aria-label={lang === "bn" ? "নোটিফিকেশন" : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-[#C9B8E8] transition-colors hover:border-[#D4AF37]/40 hover:text-[#F5C842]"
      >
        <FaBell />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#b91c1c] px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          // Mobile: fixed + inset from both screen edges, so its width is
          // whatever fits between them — can never overflow regardless of
          // where the bell itself sits in the header row. From sm: up,
          // reverts to the original button-anchored dropdown.
          className="fixed left-2 right-2 top-[68px] z-50 animate-[popIn_0.18s_ease] overflow-hidden rounded-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80"
          style={{
            background: "linear-gradient(145deg, rgba(27,8,56,0.98) 0%, rgba(10,6,18,0.99) 100%)",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="text-sm font-bold text-white">{lang === "bn" ? "নোটিফিকেশন" : "Notifications"}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-xs text-[#7B5EA7]">{lang === "bn" ? "লোড হচ্ছে…" : "Loading…"}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#7B5EA7]">
                {lang === "bn" ? "কোনো নোটিফিকেশন নেই।" : "No notifications yet."}
              </p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} notification={n} lang={lang} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
