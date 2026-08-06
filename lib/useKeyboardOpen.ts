"use client";

import { useEffect, useState } from "react";

// On mobile, focusing a text input opens the on-screen keyboard, which
// shrinks the visual viewport without changing window.innerHeight. Used to
// detect "keyboard is open" so fixed-position UI (like the bottom nav) can
// get out of the way instead of floating on top of the keyboard.
export function useKeyboardOpen(threshold = 150): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function check() {
      setOpen(window.innerHeight - vv!.height > threshold);
    }

    check();
    vv.addEventListener("resize", check);
    return () => vv.removeEventListener("resize", check);
  }, [threshold]);

  return open;
}
