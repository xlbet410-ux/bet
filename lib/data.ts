// Shared content for the casino home page.
// Centralized here so copy/data changes don't require touching component logic.

import type { IconType } from "react-icons";
import {
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";

export const NAV_LINKS = ["Home", "Live Casino", "Slots", "Sports", "Promotions", "Leaderboard"];

/** Nav index → target href. "#" entries have no dedicated page yet. */
export const NAV_HREFS = ["/", "#", "#", "#", "/promotions", "/leaderboard"];

export const PROVIDERS = [
  "Evolution Gaming",
  "Pragmatic Play",
  "Play'n GO",
  "NetEnt",
  "Spribe",
  "Microgaming",
  "Yggdrasil",
  "Quickspin",
];

export type GameItem = {
  name: string;
  provider: string;
  providerCode?: string;
  tag?: string;
  glow: string;
  img: string;
  gameUid?: string; // present only for real, launchable provider games
};

export const WINS = [
  "Mike won $1,240 — Aviator",
  "Sara won $890 — Sweet Bonanza",
  "John won $5,210 — Lightning Roulette",
  "Nadia won $325 — Crazy Time",
  "Alex won $11,200 — Mega Jackpot",
  "Tania won $678 — Blackjack VIP",
];

export const FOOTER_LINKS: Record<string, string[]> = {
  Casino: ["Slots", "Live Casino", "Jackpots", "Promotions"],
  Support: ["Help Center", "Contact Us", "FAQ", "Live Chat"],
  Legal: ["Terms & Conditions", "Privacy Policy", "Responsible Gambling", "License"],
};

export const SOCIAL_LINKS: { label: string; icon: IconType }[] = [
  { label: "Twitter", icon: FaXTwitter },
  { label: "Instagram", icon: FaInstagram },
  { label: "Telegram", icon: FaTelegram },
  { label: "Discord", icon: FaDiscord },
];

export type LeaderboardEntry = {
  rank: number;
  name: string;
  winnings: number;
  wagered: number;
  games: number;
};

// Winnings/wagered scaled so the podium (1st-3rd) reads in lakh territory
// (৳1,00,000+) with the same realistic taper the original smaller numbers
// had down to 20th place — not a flat/arbitrary curve.
export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  name: "Rakib H.",  winnings: 151800, wagered: 378900, games: 312 },
  { rank: 2,  name: "Nusrat J.", winnings: 129500, wagered: 338800, games: 289 },
  { rank: 3,  name: "Shakil A.", winnings: 104800, wagered: 298600, games: 341 },
  { rank: 4,  name: "Farzana Y.",winnings: 76700,  wagered: 218300, games: 198 },
  { rank: 5,  name: "Tanvir I.", winnings: 69200,  wagered: 197600, games: 256 },
  { rank: 6,  name: "Sadia R.",  winnings: 63200,  wagered: 177700, games: 210 },
  { rank: 7,  name: "Mahmud H.", winnings: 57200,  wagered: 157300, games: 175 },
  { rank: 8,  name: "Ruma K.",   winnings: 51000,  wagered: 142600, games: 190 },
  { rank: 9,  name: "Arif U.",   winnings: 46600,  wagered: 128900, games: 164 },
  { rank: 10, name: "Shathi A.", winnings: 41700,  wagered: 115700, games: 201 },
  { rank: 11, name: "Kamal H.",  winnings: 39100,  wagered: 107600, games: 143 },
  { rank: 12, name: "Mim S.",    winnings: 35800,  wagered: 97600,  games: 178 },
  { rank: 13, name: "Rasel M.",  winnings: 32900,  wagered: 89500,  games: 159 },
  { rank: 14, name: "Popy B.",   winnings: 30200,  wagered: 81200,  games: 132 },
  { rank: 15, name: "Jashim U.", winnings: 27400,  wagered: 74300,  games: 147 },
  { rank: 16, name: "Lima A.",   winnings: 25400,  wagered: 68000,  games: 128 },
  { rank: 17, name: "Faisal K.", winnings: 23300,  wagered: 61600,  games: 115 },
  { rank: 18, name: "Bithi R.",  winnings: 20900,  wagered: 54900,  games: 109 },
  { rank: 19, name: "Nayeem C.", winnings: 18800,  wagered: 48800,  games: 98  },
  { rank: 20, name: "Rina P.",   winnings: 17600,  wagered: 44300,  games: 87  },
];
