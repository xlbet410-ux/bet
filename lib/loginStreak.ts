export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  lastLoginDate: string | null;
  nextMilestone: number | null;
  milestones: number[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

export async function getStreakInfo(): Promise<StreakInfo> {
  const res = await fetch(`${API_URL}/login-streak/status`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load streak info.");
  return res.json();
}
