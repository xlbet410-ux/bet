"use client";

import { useEffect } from "react";
import { startInstallPromptCapture } from "@/lib/pwa";

/**
 * Renders nothing. Exists only so the `beforeinstallprompt` capture is
 * running from the moment the app boots — the browser fires that event
 * once, early, and the profile tab that offers the install button usually
 * mounts long afterwards. Mounted in Providers.
 */
export default function InstallPromptListener() {
  useEffect(() => startInstallPromptCapture(), []);
  return null;
}
