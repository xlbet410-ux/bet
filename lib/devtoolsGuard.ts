"use client";

/**
 * Best-effort developer-tools detection.
 *
 * Still not a security control, and the limits are inherent: disabling
 * JavaScript, `view-source:`, curl, or a proxy all read the page without
 * ever running this. It raises the effort required, nothing more.
 *
 * A false positive means a real player on a dead page, so the detection
 * below is built around telling DevTools apart from the things that look
 * like it rather than just flagging anything unusual.
 */

const CRAWLER_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegrambot|lighthouse|pagespeed|gtmetrix|headlesschrome/i;

// A docked panel has to be at least this wide/tall to be worth flagging.
// The height bar is higher because the browser's own title bar, tab strip,
// address bar and bookmarks bar already eat 130-170px on Windows before
// DevTools is involved at all.
const WIDTH_GAP_PX = 160;
const HEIGHT_GAP_PX = 200;

export function isCrawler() {
  if (typeof navigator === "undefined") return false;
  return CRAWLER_PATTERN.test(navigator.userAgent);
}

// Mobile browser chrome produces the same gaps, and DevTools can't be
// opened on the device anyway — so the geometry check is desktop-only.
function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
}

/**
 * Spots a docked DevTools panel by the viewport space it occupies, while
 * staying off zoomed-in players.
 *
 * The trick is which gap grows. Browser zoom shrinks the viewport in BOTH
 * directions at once, so both gaps go large together. A docked panel only
 * takes space along one axis: docked right it eats width and leaves height
 * alone, docked bottom the reverse. So one gap large is DevTools, both
 * large is somebody reading the site at 150% or 200%, and they get left
 * alone. DevTools docked while also zoomed reads as zoom and is missed,
 * which is the safe way round to be wrong.
 */
function dockedPanel() {
  if (isTouchDevice()) return false;

  const wideGap = window.outerWidth - window.innerWidth > WIDTH_GAP_PX;
  const tallGap = window.outerHeight - window.innerHeight > HEIGHT_GAP_PX;

  // Exactly one axis — see above.
  return wideGap !== tallGap;
}

/**
 * Catches an open console (including an undocked DevTools window, which
 * has no geometry to measure) by logging an object whose getter only runs
 * if something renders it.
 */
function consoleInspecting() {
  let inspected = false;

  const probe = new Image();
  Object.defineProperty(probe, "id", {
    get() {
      inspected = true;
      return "";
    },
  });

  console.log(probe);
  console.clear();

  return inspected;
}

export function devtoolsOpen() {
  if (typeof window === "undefined") return false;
  if (isCrawler()) return false;

  try {
    return dockedPanel() || consoleInspecting();
  } catch {
    // A stubbed or locked-down console must never take the page down.
    return false;
  }
}
