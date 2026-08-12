const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// Keep in sync with backend/src/notification/notification.service.ts's
// NotificationType union — the backend stores no title text, so the bilingual
// rendering per type lives client-side, same pattern as VIP tier names.
export type NotificationType =
  | "referral_signup_bonus"
  | "vip_levelup"
  | "daily_cashback"
  | "offer_bonus"
  | "kyc_approved"
  | "kyc_rejected"
  | "deposit_approved"
  | "withdrawal_approved"
  | "withdrawal_rejected";

export type AppNotification = {
  id: string;
  type: NotificationType;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsPage = {
  total: number;
  unreadCount: number;
  notifications: AppNotification[];
};

export async function getMyNotifications(page = 1): Promise<NotificationsPage> {
  const res = await fetch(`${API_URL}/notifications?page=${page}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't load notifications.");
  return res.json();
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  const res = await fetch(`${API_URL}/notifications/unread-count`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't load notification count.");
  return res.json();
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/notifications/mark-read`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't mark notifications read.");
  return res.json();
}
