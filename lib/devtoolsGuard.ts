"use client";

/**
 * Best-effort developer-tools detection.
 *
 * The limits are inherent rather than fixable, so they're worth stating:
 * this is not a security control. Anyone can turn JavaScript off and read
 * the served HTML, fetch it with curl, or run it through a proxy. It
 * deters casual poking, nothing more.
 *
 * Which shapes the tuning. A false positive means a real player staring
 * at a blank page, unable to deposit, with no idea why — far more costly
 * than the inspection this deters. So the detection deliberately errs
 * toward letting someone through.
 *
 * Notably NOT used here: comparing outerWidth/innerWidth to spot a docked
 * panel, which is the usual trick. Browser zoom shrinks the inner
 * dimensions exactly the way a docked panel does, and the two are not
 * distinguishable at runtime — devicePixelRatio folds display density and
 * zoom into one number. Tested against real window geometry it blanked
 * every player browsing at 150% or 200% zoom, which is a large share of
 * anyone using the site with impaired vision. Also not used: a `debugger`
 * loop, which freezes the whole tab.
 */

// Crawlers must never be blanked — a search engine that renders the page
// and sees nothing drops it from the index, costing far more than any
// inspection this prevents.
const CRAWLER_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegrambot|lighthouse|pagespeed|gtmetrix|headlesschrome/i;

export function isCrawler() {
  if (typeof navigator === "undefined") return false;
  return CRAWLER_PATTERN.test(navigator.userAgent);
}

/**
 * Logs an object whose property getter only runs if something actually
 * renders it — which, with no other code reading it, means the DevTools
 * console is open and formatting the entry.
 *
 * Independent of zoom, screen density, window size and device type, so it
 * cannot misfire on a zoomed-in or small-window player the way the
 * dimension heuristic does. It's blind to DevTools sitting on a non-console
 * panel, and that's the deliberate trade: miss some, blank no one wrongly.
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

  // Reading the entry is what trips the getter; the output itself is
  // cleared immediately so an open console isn't filled with probes.
  console.log(probe);
  console.clear();

  return inspected;
}

export function devtoolsOpen() {
  if (typeof window === "undefined") return false;
  if (isCrawler()) return false;

  try {
    return consoleInspecting();
  } catch {
    // A locked-down or stubbed console must never blank the page.
    return false;
  }
}
