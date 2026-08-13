"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createBalanceStreamTicket, formatBalance } from "./balance";

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  referralCode: string | null;
  memberId: string;
  balance: string;
};

type RegisterInput = {
  fullName: string;
  phoneNumber: string;
  password: string;
  referralCode?: string;
  isAdult?: boolean;
  agreedTerms: boolean;
};

type LoginInput = {
  phoneNumber: string;
  password: string;
};

type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: false,
  register: async () => {},
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

async function parseApiError(res: Response) {
  try {
    const body = await res.json();
    
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {}
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // Live wallet — deposit/withdrawal approvals, bonus grants, and every
  // settled game bet/win push a fresh balance the instant they happen,
  // instead of the player only seeing it on their next page load. Oracle's
  // game callback is server-to-server, so without this the browser would
  // have no other way to learn a bet just settled.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let stopped = false;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    async function connect() {
      if (stopped) return;
      try {
        const ticket = await createBalanceStreamTicket();
        if (stopped || cancelled) return;
        es = new EventSource(`${API_URL}/balance/stream?ticket=${ticket}`);
        es.onmessage = (event) => {
          const payload = JSON.parse(event.data) as { balance: string };
          setUser((prev) => (prev ? { ...prev, balance: formatBalance(payload.balance) } : prev));
        };
        es.onerror = () => {
          es?.close();
          if (!stopped) reconnectTimer = setTimeout(connect, 3000);
        };
      } catch {
        if (!stopped) reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      cancelled = true;
      stopped = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [userId]);

  async function register(input: RegisterInput) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }

  async function login(input: LoginInput) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function changePassword(input: ChangePasswordInput) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("You're not logged in.");
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
