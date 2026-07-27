// Shared content for the casino home page.
// Centralized here so copy/data changes don't require touching component logic.

import type { IconType } from "react-icons";
import {
  FaFutbol,
  FaGem,
  FaRocket,
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";
import { GiCardJoker } from "react-icons/gi";
import { MdCasino } from "react-icons/md";

export const NAV_LINKS = ["Home", "Live Casino", "Slots", "Sports", "Promotions", "Leaderboard"];

/** Nav index → target href. "#" entries have no dedicated page yet. */
export const NAV_HREFS = ["/", "#", "#", "#", "#", "/leaderboard"];

export type NavDropdownItem = { key: string; img: string };

/** Nav index → dropdown items. Index 0 (Home) has no dropdown. */
export const NAV_DROPDOWNS: Record<number, NavDropdownItem[]> = {
  1: [ // Live Casino
    { key: "roulette",    img: "/dragon.jpg" },
    { key: "blackjack",   img: "/book.png"   },
    { key: "baccarat",    img: "/drop.png"   },
    { key: "gameShows",   img: "/mega.png"   },
  ],
  2: [ // Slots
    { key: "popular",     img: "/book.png"   },
    { key: "newGames",    img: "/dragon.jpg" },
    { key: "jackpot",     img: "/mega.png"   },
    { key: "crash",       img: "/drop.png"   },
  ],
  3: [ // Sports
    { key: "football",    img: "/dragon.jpg" },
    { key: "cricket",     img: "/book.png"   },
    { key: "basketball",  img: "/mega.png"   },
    { key: "tennis",      img: "/drop.png"   },
  ],
  4: [ // Promotions
    { key: "welcome",     img: "/hero1.png"  },
    { key: "freeSpins",   img: "/book.png"   },
    { key: "reload",      img: "/dragon.jpg" },
    { key: "vip",         img: "/mega.png"   },
  ],
};

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

export const CATEGORIES: { label: string; icon?: IconType }[] = [
  { label: "All Games" },
  { label: "Live Casino", icon: GiCardJoker },
  { label: "Slots", icon: MdCasino },
  { label: "Sports", icon: FaFutbol },
  { label: "Crash", icon: FaRocket },
  { label: "Jackpot", icon: FaGem },
];

export const STEPS = [
  { step: "01", title: "Register", desc: "Create a free account in under 2 minutes." },
  { step: "02", title: "Deposit", desc: "Add funds via card, e-wallet, or bank transfer." },
  { step: "03", title: "Play & Win", desc: "Play your favorite games and claim your rewards." },
];

export const PAYMENT_METHODS = ["VISA", "Mastercard", "PayPal", "USDT", "Skrill", "Apple Pay", "Bank Transfer"];

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
  { rank: 1,  name: "Alexei K.", winnings: 84320, wagered: 210500, games: 312 },
  { rank: 2,  name: "Nadia R.",  winnings: 71950, wagered: 188200, games: 289 },
  { rank: 3,  name: "Marcus T.", winnings: 58200, wagered: 165900, games: 341 },
  { rank: 4,  name: "Priya S.",  winnings: 42600, wagered: 121300, games: 198 },
  { rank: 5,  name: "Liam O.",   winnings: 38450, wagered: 109800, games: 256 },
  { rank: 6,  name: "Sofia M.",  winnings: 35120, wagered: 98700,  games: 210 },
  { rank: 7,  name: "Ethan W.",  winnings: 31800, wagered: 87400,  games: 175 },
  { rank: 8,  name: "Yuki N.",   winnings: 28340, wagered: 79200,  games: 190 },
  { rank: 9,  name: "Carlos D.", winnings: 25900, wagered: 71600,  games: 164 },
  { rank: 10, name: "Mei L.",    winnings: 23150, wagered: 64300,  games: 201 },
  { rank: 11, name: "Omar F.",   winnings: 21700, wagered: 59800,  games: 143 },
  { rank: 12, name: "Elena V.",  winnings: 19880, wagered: 54200,  games: 178 },
  { rank: 13, name: "Jack H.",   winnings: 18300, wagered: 49700,  games: 159 },
  { rank: 14, name: "Ana P.",    winnings: 16750, wagered: 45100,  games: 132 },
  { rank: 15, name: "Dmitri K.", winnings: 15200, wagered: 41300,  games: 147 },
  { rank: 16, name: "Tara B.",   winnings: 14100, wagered: 37800,  games: 128 },
  { rank: 17, name: "Felix R.",  winnings: 12950, wagered: 34200,  games: 115 },
  { rank: 18, name: "Ines C.",   winnings: 11600, wagered: 30500,  games: 109 },
  { rank: 19, name: "Noah G.",   winnings: 10450, wagered: 27100,  games: 98  },
  { rank: 20, name: "Hana S.",   winnings: 9800,  wagered: 24600,  games: 87  },
];
