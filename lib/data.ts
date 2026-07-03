// Shared content for the casino home page.
// Centralized here so copy/data changes don't require touching component logic.

import type { IconType } from "react-icons";
import {
  FaFire,
  FaFutbol,
  FaBasketball,
  FaVolleyball,
  FaGem,
  FaRocket,
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";
import { GiCricketBat, GiTennisBall, GiCardJoker } from "react-icons/gi";
import { MdCasino } from "react-icons/md";

export type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
};

export const SLIDES: Slide[] = [
  {
    img: "/hero1.png",
    eyebrow: "Welcome Bonus",
    title: "100% up to $500",
    desc: "Double your first deposit and get 100 free spins.",
    cta: "Claim Bonus",
  },
  {
    img: "/hero2.png",
    eyebrow: "Live Casino",
    title: "Real Dealers, Real Thrills",
    desc: "Roulette, Blackjack & Baccarat — streamed live.",
    cta: "Play Live",
  },
  {
    img: "/hero3.png",
    eyebrow: "Mega Jackpot",
    title: "Your Big Win Is Waiting",
    desc: "3000+ slots and jackpot games in one place.",
    cta: "Play Now",
  },
];

export const NAV_LINKS = ["Home", "Live Casino", "Slots", "Sports", "Promotions"];

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
};

// the headline pick — shown as the large featured tile
export const FEATURED_GAME: GameItem = {
  name: "Book of Dead",
  provider: "Play'n GO",
  tag: "HOT",
  glow: "#f59e0b",
  img: "/book.png",
};

export const GRID_GAMES: GameItem[] = [
  { name: "Dragon's Treasure", provider: "Pragmatic Play", tag: "NEW",     glow: "#ef4444", img: "/dragon.jpg" },
  { name: "Mega Fortune",      provider: "NetEnt",         tag: "JACKPOT", glow: "#22d3ee", img: "/mega.png"   },
  { name: "Aviator",           provider: "Spribe",         tag: "HOT",     glow: "#f97316", img: "/drop.png"   },
  { name: "Sweet Bonanza",     provider: "Pragmatic",      tag: "POPULAR", glow: "#ec4899", img: "/book.png"   },
  { name: "Lightning Roulette",provider: "Evolution",      tag: "LIVE",    glow: "#F5C842", img: "/dragon.jpg" },
  { name: "Crazy Time",        provider: "Evolution",      tag: "LIVE",    glow: "#9B30FF", img: "/mega.png"   },
  { name: "Gates of Olympus",  provider: "Pragmatic",      tag: "NEW",     glow: "#3b82f6", img: "/drop.png"   },
  { name: "Plinko",            provider: "Spribe",         tag: "TRENDING",glow: "#22c55e", img: "/book.png"   },
  { name: "Mines",             provider: "Spribe",         tag: "NEW",     glow: "#06b6d4", img: "/dragon.jpg" },
  { name: "Blackjack VIP",     provider: "Evolution",      tag: "VIP",     glow: "#D4AF37", img: "/mega.png"   },
];

export type Match = {
  sport: string;
  league: string;
  sportIcon: IconType;
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  time: string;
  oddsHome: number;
  oddsDraw?: number;
  oddsAway: number;
  glow: string;
};

export const SPORTS: { label: string; icon: IconType }[] = [
  { label: "All Sports", icon: FaFire },
  { label: "Football", icon: FaFutbol },
  { label: "Cricket", icon: GiCricketBat },
  { label: "Tennis", icon: GiTennisBall },
  { label: "Basketball", icon: FaBasketball },
  { label: "Volleyball", icon: FaVolleyball },
];

export const LIVE_MATCHES: Match[] = [
  {
    sport: "Football",
    league: "Premier League",
    sportIcon: FaFutbol,
    home: "Arsenal",
    away: "Chelsea",
    homeScore: "2",
    awayScore: "1",
    time: "67'",
    oddsHome: 1.85,
    oddsDraw: 3.4,
    oddsAway: 4.2,
    glow: "#22c55e",
  },
  {
    sport: "Cricket",
    league: "ICC World Cup",
    sportIcon: GiCricketBat,
    home: "India",
    away: "Australia",
    homeScore: "245/4",
    awayScore: "—",
    time: "38.2 ov",
    oddsHome: 1.55,
    oddsAway: 2.6,
    glow: "#3b82f6",
  },
  {
    sport: "Tennis",
    league: "ATP Masters",
    sportIcon: GiTennisBall,
    home: "Alcaraz",
    away: "Sinner",
    homeScore: "2",
    awayScore: "1",
    time: "Set 4",
    oddsHome: 1.4,
    oddsAway: 2.9,
    glow: "#f59e0b",
  },
  {
    sport: "Basketball",
    league: "NBA",
    sportIcon: FaBasketball,
    home: "Lakers",
    away: "Celtics",
    homeScore: "88",
    awayScore: "92",
    time: "Q4 4:12",
    oddsHome: 2.1,
    oddsAway: 1.7,
    glow: "#ec4899",
  },
];

export const SLOT_GAMES: GameItem[] = [
  { name: "Gates of Olympus",  provider: "Pragmatic Play", tag: "HOT",      glow: "#9B30FF", img: "/book.png"   },
  { name: "Sweet Bonanza",     provider: "Pragmatic Play", tag: "POPULAR",  glow: "#ec4899", img: "/dragon.jpg" },
  { name: "Big Bass Bonanza",  provider: "Pragmatic Play", tag: "NEW",      glow: "#3b82f6", img: "/drop.png"   },
  { name: "Wolf Gold",         provider: "Pragmatic Play", tag: "JACKPOT",  glow: "#f97316", img: "/mega.png"   },
  { name: "The Dog House",     provider: "Pragmatic Play", tag: "HOT",      glow: "#F5C842", img: "/book.png"   },
  { name: "Fire Strike",       provider: "Pragmatic Play", tag: "NEW",      glow: "#ef4444", img: "/dragon.jpg" },
  { name: "Starlight Princess",provider: "Pragmatic Play", tag: "TRENDING", glow: "#22d3ee", img: "/drop.png"   },
  { name: "Floating Dragon",   provider: "Pragmatic Play", tag: "NEW",      glow: "#22c55e", img: "/dragon.jpg" },
];

export const LIVE_CASINO_GAMES: GameItem[] = [
  { name: "Lightning Roulette",provider: "Evolution", tag: "LIVE",    glow: "#F5C842", img: "/mega.png"   },
  { name: "Crazy Time",        provider: "Evolution", tag: "LIVE",    glow: "#9B30FF", img: "/book.png"   },
  { name: "Dream Catcher",     provider: "Evolution", tag: "HOT",     glow: "#ec4899", img: "/dragon.jpg" },
  { name: "Monopoly Live",     provider: "Evolution", tag: "HOT",     glow: "#3b82f6", img: "/drop.png"   },
  { name: "Blackjack VIP",     provider: "Evolution", tag: "VIP",     glow: "#D4AF37", img: "/mega.png"   },
  { name: "Mega Ball",         provider: "Evolution", tag: "NEW",     glow: "#22d3ee", img: "/book.png"   },
  { name: "Side Bet City",     provider: "Evolution", tag: "HOT",     glow: "#f97316", img: "/dragon.jpg" },
  { name: "Football Studio",   provider: "Evolution", tag: "LIVE",    glow: "#22c55e", img: "/drop.png"   },
];

export const POKER_GAMES: GameItem[] = [
  { name: "Texas Hold'em",         provider: "Evolution", tag: "HOT",     glow: "#D4AF37", img: "/drop.png"   },
  { name: "Three Card Poker",      provider: "Evolution", tag: "POPULAR", glow: "#ef4444", img: "/book.png"   },
  { name: "Caribbean Stud",        provider: "Playtech",  tag: "NEW",     glow: "#22d3ee", img: "/mega.png"   },
  { name: "Casino Hold'em",        provider: "Evolution", tag: "LIVE",    glow: "#3b82f6", img: "/dragon.jpg" },
  { name: "Pai Gow Poker",         provider: "Evolution", tag: "HOT",     glow: "#9B30FF", img: "/drop.png"   },
  { name: "Ultimate Texas Hold'em",provider: "Evolution", tag: "VIP",     glow: "#F5C842", img: "/book.png"   },
  { name: "Let It Ride",           provider: "Playtech",  tag: "NEW",     glow: "#22c55e", img: "/mega.png"   },
  { name: "Oasis Poker",           provider: "Playtech",  tag: "HOT",     glow: "#ec4899", img: "/dragon.jpg" },
];

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
