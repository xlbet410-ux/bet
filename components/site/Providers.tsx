"use client";

import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
