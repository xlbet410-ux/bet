import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/site/Providers";

// display + body font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// kept for the jackpot / numeric mono styling
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://2xlbet.com";
const SITE_NAME = "2XLbet";
const TITLE = "2XLbet — Online Casino & Sports Betting in Bangladesh";
const DESCRIPTION =
  "2XLbet is a Bangladesh-focused online casino and sports betting platform — live casino, slots, cricket & sports betting, VIP rewards, and welcome bonuses up to ৳2,000. Fast bKash, Nagad & Rocket deposits and withdrawals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "2xlbet",
    "2xl bet",
    "2xlbet casino",
    "online casino Bangladesh",
    "betting site Bangladesh",
    "cricket betting Bangladesh",
    "sports betting BD",
    "live casino Bangladesh",
    "online betting bd",
    "bkash casino",
    "slots Bangladesh",
    "বেটিং সাইট",
    "অনলাইন ক্যাসিনো",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Bangladesh geo-targeting — read by some search engines and directories
  // alongside the sitemap/hreflang signals; harmless everywhere else.
  other: {
    "geo.region": "BD",
    "geo.placename": "Bangladesh",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "bn_BD",
    alternateLocale: "en_US",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/icon.png"],
  },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "2XL Bet",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  areaServed: {
    "@type": "Country",
    name: "Bangladesh",
  },
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#0A0612]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}