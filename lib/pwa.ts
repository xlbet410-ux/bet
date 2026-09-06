"use client";

/**
 * Add-to-home-screen plumbing.
 *
 * Chrome fires `beforeinstallprompt` once, early in the page load, and the
 * saved event is the ONLY way to open the install dialog later — you can't
 * summon it on demand. The profile tab that uses it usually mounts long
 * after that (a client-side navigation away from the home page), so the
 * listener has to be registered app-wide at startup, not in the tab. See
 * InstallPromptListener, mounted in Providers.
 *
 * iOS Safari implements none of this: there is no event and no API, so the
 * only honest thing to show an iPhone user is the manual Share-sheet steps.
 */

// Not in TS's DOM lib — Chromium-only, hence the local shape.
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Registered once at startup so the one-shot event is never missed. */
export function startInstallPromptCapture() {
  if (typeof window === "undefined") return () => {};

  const onBeforeInstall = (e: Event) => {
    // Suppress Chrome's own mini-infobar so the only way in is our button.
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  };
  const onInstalled = () => {
    // Consumed — it can't be reused, and the app is on the home screen now.
    deferredPrompt = null;
    emit();
  };

  window.addEventListener("beforeinstallprompt", onBeforeInstall);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export function subscribeToInstallPrompt(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function canPromptInstall() {
  return deferredPrompt !== null;
}

/** Server has no prompt — keeps useSyncExternalStore hydration-safe. */
export const canPromptInstallOnServer = () => false;

/**
 * Opens the browser's install dialog. Returns whether the app was actually
 * added, so the caller can show the result. The saved event is single-use
 * either way, so it's cleared regardless of the answer.
 */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const event = deferredPrompt;
  deferredPrompt = null;
  emit();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "dismissed";
  }
}

/** True once launched from the home screen rather than a browser tab. */
export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own non-standard flag — the only signal it gives.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as a Mac; the touch check separates it.
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}
