import type { MetadataRoute } from "next";

const SITE_URL = "https://2xlbet.com";

// Only genuinely public, crawlable marketing pages — account pages
// (profile, my-bonuses, deposit-withdraw, referral dashboard, live game
// frames) are excluded here and blocked in robots.ts, since they're
// personal/auth-gated and not something search results should send anyone to.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/promotions`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/vip`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/vip-level`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/referral-program`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];
}
