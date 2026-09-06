"use client";

import { useEffect } from "react";
import { devtoolsOpen } from "@/lib/devtoolsGuard";

// Cheap enough to run on a timer, and catches DevTools opened after load
// or via a shortcut that fires no resize event.
const POLL_MS = 500;

/**
 * Tears the page down while developer tools appear to be open.
 *
 * Not an overlay: an overlay leaves the whole document sitting in the
 * Elements panel to be read and deleted. This empties the document
 * instead, so Elements has nothing left to show.
 *
 * That makes it one-way — the page is gone until reloaded, and reloading
 * with the tools still open empties it again. Deliberate, and the reason
 * the detection in lib/devtoolsGuard errs so hard toward letting people
 * through: getting this wrong strands a real player on a dead page.
 *
 * Nothing runs on the server and nothing happens before hydration, so the
 * served HTML is always the real page. Crawlers, link previews and
 * visitors without JavaScript are unaffected.
 */
export default function DevToolsGuard() {
  useEffect(() => {
    let dead = false;

    function teardown() {
      if (dead) return;
      dead = true;

      try {
        // Drop every node, then rebuild the bare minimum a document needs
        // so the browser still has somewhere to paint.
        document.documentElement.replaceChildren(
          document.createElement("head"),
          document.createElement("body"),
        );
        document.documentElement.style.background = "#0A0612";
        document.title = "";
      } catch {
        // If the document can't be rewritten, hide it instead.
        try {
          document.documentElement.style.visibility = "hidden";
        } catch {
          // Nothing further to try.
        }
      }
    }

    const check = () => {
      if (devtoolsOpen()) teardown();
    };

    check();
    const timer = setInterval(check, POLL_MS);
    window.addEventListener("resize", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", check);
    };
  }, []);

  return null;
}
