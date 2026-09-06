"use client";

import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import NavigationLoader from "./NavigationLoader";
import InstallPromptListener from "./InstallPromptListener";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationLoader />
        <InstallPromptListener />
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
