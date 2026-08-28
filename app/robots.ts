import type { MetadataRoute } from "next";

const SITE_URL = "https://2xlbet.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account-only pages: nothing useful to index, and they either
        // redirect to a login prompt or show private data — keep crawlers
        // off them rather than let them show up as dead-end search results.
        disallow: ["/profile", "/my-bonuses", "/deposit-withdraw", "/referral", "/play/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
