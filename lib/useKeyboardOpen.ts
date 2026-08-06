"use client";

import { useEffect, useState } from "react";

// On mobile, focusing a text input opens the on-screen keyboard, which
// shrinks the visual viewport without changing window.innerHeight. Returns
// the keyboard's height in px (0 when closed) so fixed-position UI at the
// bottom of the screen (like the bottom nav) can shift up to sit just above
// the keyboard instead of being hidden underneath it.
export function useKeyboardOffset(threshold = 150): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function check() {
      const diff = window.innerHeight - vv!.height - vv!.offsetTop;
      setOffset(diff > threshold ? diff : 0);
    }

    check();
    vv.addEventListener("resize", check);
    vv.addEventListener("scroll", check);
    return () => {
      vv.removeEventListener("resize", check);
      vv.removeEventListener("scroll", check);
    };
  }, [threshold]);

  return offset;
}
