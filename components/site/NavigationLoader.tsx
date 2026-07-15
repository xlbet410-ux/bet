"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "./Loader";

const MIN_VISIBLE_MS = 700;
const SAFETY_TIMEOUT_MS = 4000;

export default function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);
  const prevPathRef = useRef(pathname);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // show as soon as the user clicks an internal link
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return;
      if (href === window.location.pathname) return;

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      shownAtRef.current = Date.now();
      setVisible(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // hide once the route has actually changed, honoring a minimum display time
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    if (!visible) return;

    const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - shownAtRef.current), 0);
    hideTimerRef.current = setTimeout(() => setVisible(false), remaining);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pathname, visible]);

  // safety net in case a navigation never resolves (e.g. click didn't trigger a route change)
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [visible]);

  return <Loader done={!visible} />;
}
