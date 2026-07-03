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

export const metadata: Metadata = {
  title: "2XLbet Casino — Live Casino, Slots & Sports Betting",
  description:
    "Live casino, slots, sports betting and mega jackpots. Welcome bonus up to $500. Fast, secure deposits and withdrawals.",
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
      <body
        className="min-h-full flex flex-col bg-[#0A0612]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}