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

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  name: "Rakib H.",  winnings: 84320, wagered: 210500, games: 312 },
  { rank: 2,  name: "Nusrat J.", winnings: 71950, wagered: 188200, games: 289 },
  { rank: 3,  name: "Shakil A.", winnings: 58200, wagered: 165900, games: 341 },
  { rank: 4,  name: "Farzana Y.",winnings: 42600, wagered: 121300, games: 198 },
  { rank: 5,  name: "Tanvir I.", winnings: 38450, wagered: 109800, games: 256 },
  { rank: 6,  name: "Sadia R.",  winnings: 35120, wagered: 98700,  games: 210 },
  { rank: 7,  name: "Mahmud H.", winnings: 31800, wagered: 87400,  games: 175 },
  { rank: 8,  name: "Ruma K.",   winnings: 28340, wagered: 79200,  games: 190 },
  { rank: 9,  name: "Arif U.",   winnings: 25900, wagered: 71600,  games: 164 },
  { rank: 10, name: "Shathi A.", winnings: 23150, wagered: 64300,  games: 201 },
  { rank: 11, name: "Kamal H.",  winnings: 21700, wagered: 59800,  games: 143 },
  { rank: 12, name: "Mim S.",    winnings: 19880, wagered: 54200,  games: 178 },
  { rank: 13, name: "Rasel M.",  winnings: 18300, wagered: 49700,  games: 159 },
  { rank: 14, name: "Popy B.",   winnings: 16750, wagered: 45100,  games: 132 },
  { rank: 15, name: "Jashim U.", winnings: 15200, wagered: 41300,  games: 147 },
  { rank: 16, name: "Lima A.",   winnings: 14100, wagered: 37800,  games: 128 },
  { rank: 17, name: "Faisal K.", winnings: 12950, wagered: 34200,  games: 115 },
  { rank: 18, name: "Bithi R.",  winnings: 11600, wagered: 30500,  games: 109 },
  { rank: 19, name: "Nayeem C.", winnings: 10450, wagered: 27100,  games: 98  },
  { rank: 20, name: "Rina P.",   winnings: 9800,  wagered: 24600,  games: 87  },
];
