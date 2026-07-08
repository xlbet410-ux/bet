"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AuthUser = { name: string; phone: string; balance: string };

type AuthCtx = {
  user: AuthUser | null;
  login: (name: string, phone: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("2xlbet:user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  function login(name: string, phone: string) {
    const u: AuthUser = { name, phone, balance: "$1,250.00" };
    setUser(u);
    localStorage.setItem("2xlbet:user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("2xlbet:user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
