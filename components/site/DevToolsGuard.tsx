"use client";

import { useEffect, useState } from "react";
import { devtoolsOpen } from "@/lib/devtoolsGuard";

// Cheap enough to run on a timer, and catches DevTools opened after load
// or on a keyboard shortcut that fires no resize event.
const POLL_MS = 800;

/**
 * Blanks the page while developer tools appear to be open, and again on
 * reload if they're still open.
 *
 * Nothing renders on the server and nothing blanks before hydration, so
 * the served HTML is always the real page — crawlers, previews and
 * no-JavaScript visitors are unaffected, and there is no flash of blank
 * on a normal load.
 *
 * Worth repeating what lib/devtoolsGuard says: this deters casual poking
 * and nothing more. Anyone can turn JavaScript off and read the page
 * anyway, or open DevTools in a separate window, which this cannot see.
 */
export default function DevToolsGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const check = () => setBlocked(devtoolsOpen());

    check();
    const timer = setInterval(check, POLL_MS);
    window.addEventListener("resize", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      // Opaque, covers everything, and blocks interaction with whatever is
      // underneath. Removed by itself the moment the tools are closed.
      className="fixed inset-0 z-[2147483647] bg-[#0A0612]"
      aria-hidden="true"
    />
  );
}
