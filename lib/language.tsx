"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

export type Translations = {
  // header / nav
  nav: string[];
  login: string;
  register: string;
  // nav dropdown labels (keyed by item key from NAV_DROPDOWNS)
  dropdownLabels: Record<string, string>;
  // chat widget
  chatTitle: string;
  chatSubtitle: string;
  chatPlaceholder: string;
  chatWelcome: string;
  chatAutoReply: string;
  // hero slider stats
  statGames: string;
  statPlayers: string;
  statSupport: string;
  // category chips (same order as CATEGORIES in data.ts)
  categories: string[];
  // shared labels
  recommend: string;
  viewAll: string;
  loadMoreGames: string;
  loadMore: string;
  // hot games section words
  hotWord: string;
  hotHighlight: string;
  // slots section
  slotsWord: string;
  slotsHighlight: string;
  // live casino section
  lcWord: string;
  lcHighlight: string;
  // poker section
  pokerWord: string;
  pokerHighlight: string;
  // live sports section
  liveNow: string;
  sportsWord: string;
  sportsHighlight: string;
  sportLabels: string[];        // must match SPORTS order in data.ts
  noMatches: string;
  // jackpot banner
  jackpotEyebrow: string;
  jackpotDesc: string;
  jackpotPlay: string;
  // welcome bonus
  welcomeEyebrow: string;
  welcomeAmount: string;
  welcomeDesc: string;
  claimBonus: string;
  // how it works
  howTitle: string;
  howHighlight: string;
  howSub: string;
  steps: { title: string; desc: string }[];
  // payment methods
  paymentTitle: string;
  paymentSub: string;
  // cta strip
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  // live wins ticker
  liveWinsLabel: string;
  liveWinsSub: string;
  wins: { name: string; game: string; amount: string; value: number }[];
  // leaderboard page
  lbBreadcrumb: string;
  lbEyebrow: string;
  lbTitleWord: string;
  lbTitleHighlight: string;
  lbDesc: string;
  lbGames: string;
  lbWagered: string;
  lbPlace1: string;
  lbPlace2: string;
  lbPlace3: string;
  // footer
  footerDesc: string;
  footerGroups: { heading: string; links: string[] }[];
  footerAge: string;
  footerCopyright: string;
  // promo popup
  promoDesc: string;
  promoButton: string;
  promoLater: string;
  // auth modal
  authLoginTitle: string;
  authRegisterTitle: string;
  authLoginSub: string;
  authRegisterSub: string;
  authPhoneLabel: string;
  authPhonePlaceholder: string;
  authPasswordLabel: string;
  authPasswordPlaceholder: string;
  authConfirmLabel: string;
  authReferralLabel: string;
  authReferralOptional: string;
  authReferralPlaceholder: string;
  authConsent: string;
  authTerms: string;
  authPrivacy: string;
  authForgot: string;
  authLoginBtn: string;
  authSignupBtn: string;
  authHaveAccount: string;
  authNoAccount: string;
  authSwitchToLogin: string;
  authSwitchToSignup: string;
  authNameLabel: string;
  authNamePlaceholder: string;
  authErrPhone: string;
  authErrPassword: string;
  authErrMatch: string;
  authErrTerms: string;
  authErrName: string;
  logout: string;
  balance: string;
  myProfile: string;
  deposit: string;
};

const T: Record<Lang, Translations> = {
  en: {
    nav: ["Home", "Live Casino", "Slots", "Sports", "Promotions", "Leaderboard"],
    login: "Log In",
    register: "Sign Up",
    dropdownLabels: {
      roulette: "Roulette", blackjack: "Blackjack", baccarat: "Baccarat", gameShows: "Game Shows",
      popular: "Popular Slots", newGames: "New Games", jackpot: "Jackpot Slots", crash: "Crash Games",
      football: "Football", cricket: "Cricket", basketball: "Basketball", tennis: "Tennis",
      welcome: "Welcome Bonus", freeSpins: "Free Spins", reload: "Reload Bonus", vip: "VIP Club",
    },

    chatTitle: "Live Support",
    chatSubtitle: "Online · Avg. reply < 1 min",
    chatPlaceholder: "Type your message…",
    chatWelcome: "👋 Hi! Welcome to 2XLbet. How can we help you today?",
    chatAutoReply: "Thanks for reaching out! An agent will be with you shortly.",

    statGames: "Casino Games",
    statPlayers: "Active Players",
    statSupport: "Live Support",

    categories: ["All Games", "Live Casino", "Slots", "Sports", "Crash", "Jackpot"],

    recommend: "Recommend",
    viewAll: "View All",
    loadMoreGames: "Load More Games",
    loadMore: "Load More",

    hotWord: "Hot",
    hotHighlight: "Games",
    slotsWord: "Top",
    slotsHighlight: "Slots",
    lcWord: "Live",
    lcHighlight: "Casino",
    pokerWord: "Poker",
    pokerHighlight: "Tables",

    liveNow: "Live Now",
    sportsWord: "Live",
    sportsHighlight: "Sports",
    sportLabels: ["All Sports", "Football", "Cricket", "Tennis", "Basketball", "Volleyball"],
    noMatches: "No live matches right now — check back soon.",

    jackpotEyebrow: "Mega Jackpot",
    jackpotDesc: "Growing every second — you could be the next winner",
    jackpotPlay: "Play Jackpot",

    welcomeEyebrow: "Welcome Package",
    welcomeAmount: "100% up to $500",
    welcomeDesc: "Double your first deposit + 100 free spins",
    claimBonus: "Claim Bonus",

    howTitle: "Get Started in",
    howHighlight: "3 Steps",
    howSub: "Simple, fast and secure",
    steps: [
      { title: "Register", desc: "Create a free account in under 2 minutes." },
      { title: "Deposit", desc: "Add funds via card, e-wallet, or bank transfer." },
      { title: "Play & Win", desc: "Play your favorite games and claim your rewards." },
    ],

    paymentTitle: "Payment Methods",
    paymentSub: "Fast · Secure · 100% Confidential",

    ctaTitle: "Test Your Luck Today",
    ctaDesc: "Join over 500,000 players — your win is waiting",
    ctaButton: "Create Free Account",

    liveWinsLabel: "Live Wins",
    liveWinsSub: "Real players, real payouts — right now",
    wins: [
      { name: "Mike", game: "Aviator", amount: "$1,240", value: 1240 },
      { name: "Sara", game: "Sweet Bonanza", amount: "$890", value: 890 },
      { name: "John", game: "Lightning Roulette", amount: "$5,210", value: 5210 },
      { name: "Nadia", game: "Crazy Time", amount: "$325", value: 325 },
      { name: "Alex", game: "Mega Jackpot", amount: "$11,200", value: 11200 },
      { name: "Tania", game: "Blackjack VIP", amount: "$678", value: 678 },
    ],

    lbBreadcrumb: "Leaderboard",
    lbEyebrow: "This Week",
    lbTitleWord: "Top",
    lbTitleHighlight: "Winners",
    lbDesc: "Ranked by total winnings this week — climb the ranks and earn bonus rewards.",
    lbGames: "games",
    lbWagered: "wagered",
    lbPlace1: "Champion",
    lbPlace2: "Runner-up",
    lbPlace3: "3rd Place",

    footerDesc:
      "2XLbet is a premium online casino and sportsbook offering live casino games, slots, and sports betting with fast, secure payouts.",
    footerGroups: [
      { heading: "Casino", links: ["Slots", "Live Casino", "Jackpots", "Promotions"] },
      { heading: "Support", links: ["Help Center", "Contact Us", "FAQ", "Live Chat"] },
      { heading: "Legal", links: ["Terms & Conditions", "Privacy Policy", "Responsible Gambling", "License"] },
    ],
    footerAge:
      "Play responsibly. Gambling can be addictive — for ages 18+ only. Licensed and regulated for fair, secure gameplay.",
    footerCopyright: "© 2026 2XLbet Casino — All rights reserved.",

    promoDesc: "Create your account now to claim this limited-time welcome offer.",
    promoButton: "Claim Bonus",
    promoLater: "Maybe later",

    authLoginTitle: "Log In",
    authRegisterTitle: "Create Account",
    authLoginSub: "Enter your phone number to continue",
    authRegisterSub: "Create your account in under a minute",
    authPhoneLabel: "Phone Number",
    authPhonePlaceholder: "+1 234 567 8900",
    authPasswordLabel: "Password",
    authPasswordPlaceholder: "••••••••",
    authConfirmLabel: "Confirm Password",
    authReferralLabel: "Referral Code",
    authReferralOptional: "(optional)",
    authReferralPlaceholder: "Enter code if you have one",
    authConsent: "I am 18+ and agree to the",
    authTerms: "Terms & Conditions",
    authPrivacy: "Privacy Policy",
    authForgot: "Forgot password?",
    authLoginBtn: "Log In",
    authSignupBtn: "Sign Up",
    authHaveAccount: "Already have an account?",
    authNoAccount: "Don't have an account?",
    authSwitchToLogin: "Log In",
    authSwitchToSignup: "Sign Up",
    authErrPhone: "Please enter a valid phone number.",
    authNameLabel: "Full Name",
    authNamePlaceholder: "Enter your full name",
    authErrName: "Please enter your name.",
    authErrPassword: "Password must be at least 6 characters.",
    authErrMatch: "Passwords do not match.",
    authErrTerms: "Please agree to the terms.",
    logout: "Log Out",
    balance: "Balance",
    myProfile: "My Profile",
    deposit: "Deposit",
  },

  bn: {
    nav: ["হোম", "লাইভ ক্যাসিনো", "স্লট", "স্পোর্টস", "প্রমোশন", "লিডারবোর্ড"],
    login: "লগইন",
    register: "নিবন্ধন",
    dropdownLabels: {
      roulette: "রুলেট", blackjack: "ব্ল্যাকজ্যাক", baccarat: "ব্যাকারাট", gameShows: "গেম শো",
      popular: "জনপ্রিয় স্লট", newGames: "নতুন গেম", jackpot: "জ্যাকপট স্লট", crash: "ক্র্যাশ গেম",
      football: "ফুটবল", cricket: "ক্রিকেট", basketball: "বাস্কেটবল", tennis: "টেনিস",
      welcome: "স্বাগত বোনাস", freeSpins: "ফ্রি স্পিন", reload: "রিলোড বোনাস", vip: "ভিআইপি ক্লাব",
    },

    chatTitle: "লাইভ সাপোর্ট",
    chatSubtitle: "অনলাইন · গড় রিপ্লাই < ১ মিনিট",
    chatPlaceholder: "আপনার বার্তা লিখুন…",
    chatWelcome: "👋 হ্যালো! 2XLbet-এ স্বাগতম। আজ আমরা আপনাকে কীভাবে সাহায্য করতে পারি?",
    chatAutoReply: "আপনার বার্তার জন্য ধন্যবাদ! একজন এজেন্ট শীঘ্রই আপনার সাথে যোগাযোগ করবে।",

    statGames: "ক্যাসিনো গেমস",
    statPlayers: "সক্রিয় খেলোয়াড়",
    statSupport: "লাইভ সাপোর্ট",

    categories: ["সব গেমস", "লাইভ ক্যাসিনো", "স্লট", "স্পোর্টস", "ক্র্যাশ", "জ্যাকপট"],

    recommend: "প্রস্তাবিত",
    viewAll: "সব দেখুন",
    loadMoreGames: "আরও গেমস",
    loadMore: "আরও লোড করুন",

    hotWord: "হট",
    hotHighlight: "গেমস",
    slotsWord: "সেরা",
    slotsHighlight: "স্লট",
    lcWord: "লাইভ",
    lcHighlight: "ক্যাসিনো",
    pokerWord: "পোকার",
    pokerHighlight: "টেবিল",

    liveNow: "এখন লাইভ",
    sportsWord: "লাইভ",
    sportsHighlight: "স্পোর্টস",
    sportLabels: ["সব স্পোর্টস", "ফুটবল", "ক্রিকেট", "টেনিস", "বাস্কেটবল", "ভলিবল"],
    noMatches: "এখন কোনো লাইভ ম্যাচ নেই — শীঘ্রই চেক করুন।",

    jackpotEyebrow: "মেগা জ্যাকপট",
    jackpotDesc: "প্রতি মুহূর্তে বাড়ছে — আপনিই হতে পারেন পরবর্তী বিজয়ী",
    jackpotPlay: "জ্যাকপট খেলুন",

    welcomeEyebrow: "স্বাগত প্যাকেজ",
    welcomeAmount: "১০০% পর্যন্ত $৫০০",
    welcomeDesc: "প্রথম ডিপোজিট দ্বিগুণ + ১০০ ফ্রি স্পিন",
    claimBonus: "বোনাস নিন",

    howTitle: "শুরু করুন",
    howHighlight: "৩ ধাপে",
    howSub: "সহজ, দ্রুত এবং নিরাপদ",
    steps: [
      { title: "নিবন্ধন করুন", desc: "২ মিনিটের কম সময়ে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।" },
      { title: "ডিপোজিট করুন", desc: "কার্ড, ই-ওয়ালেট বা ব্যাংক ট্রান্সফারের মাধ্যমে অর্থ যোগ করুন।" },
      { title: "খেলুন ও জিতুন", desc: "আপনার পছন্দের গেম খেলুন এবং পুরস্কার জিতুন।" },
    ],

    paymentTitle: "পেমেন্ট পদ্ধতি",
    paymentSub: "দ্রুত · নিরাপদ · ১০০% গোপনীয়",

    ctaTitle: "আজই ভাগ্য পরীক্ষা করুন",
    ctaDesc: "৫,০০,০০০+ খেলোয়াড়ের সাথে যোগ দিন — আপনার জয় অপেক্ষা করছে",
    ctaButton: "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন",

    liveWinsLabel: "লাইভ জয়",
    liveWinsSub: "আসল খেলোয়াড়, আসল পেআউট — এই মুহূর্তে",
    wins: [
      { name: "মাইক", game: "Aviator", amount: "$১,২৪০", value: 1240 },
      { name: "সারা", game: "Sweet Bonanza", amount: "$৮৯০", value: 890 },
      { name: "জন", game: "Lightning Roulette", amount: "$৫,২১০", value: 5210 },
      { name: "নাদিয়া", game: "Crazy Time", amount: "$৩২৫", value: 325 },
      { name: "অ্যালেক্স", game: "Mega Jackpot", amount: "$১১,২০০", value: 11200 },
      { name: "তানিয়া", game: "Blackjack VIP", amount: "$৬৭৮", value: 678 },
    ],

    lbBreadcrumb: "লিডারবোর্ড",
    lbEyebrow: "এই সপ্তাহে",
    lbTitleWord: "সেরা",
    lbTitleHighlight: "বিজয়ীরা",
    lbDesc: "এই সপ্তাহের মোট জয়ের ভিত্তিতে র‍্যাংক করা হয়েছে — র‍্যাংক বাড়ান এবং বোনাস পুরস্কার অর্জন করুন।",
    lbGames: "গেমস",
    lbWagered: "বাজি",
    lbPlace1: "চ্যাম্পিয়ন",
    lbPlace2: "রানার-আপ",
    lbPlace3: "৩য় স্থান",

    footerDesc:
      "2XLbet হলো একটি প্রিমিয়াম অনলাইন ক্যাসিনো এবং স্পোর্টসবুক যা লাইভ ক্যাসিনো গেমস, স্লট এবং স্পোর্টস বেটিং অফার করে দ্রুত, নিরাপদ পেআউট সহ।",
    footerGroups: [
      { heading: "ক্যাসিনো", links: ["স্লট", "লাইভ ক্যাসিনো", "জ্যাকপট", "প্রমোশন"] },
      { heading: "সাপোর্ট", links: ["হেল্প সেন্টার", "যোগাযোগ করুন", "FAQ", "লাইভ চ্যাট"] },
      { heading: "আইনি", links: ["নিয়ম ও শর্তাবলী", "গোপনীয়তা নীতি", "দায়িত্বশীল জুয়া", "লাইসেন্স"] },
    ],
    footerAge: "দায়িত্বের সাথে খেলুন। জুয়া আসক্তিকর হতে পারে — শুধুমাত্র ১৮+ বছরের জন্য। ন্যায্য ও নিরাপদ গেমপ্লের জন্য লাইসেন্সপ্রাপ্ত।",
    footerCopyright: "© ২০২৬ 2XLbet ক্যাসিনো — সর্বস্বত্ব সংরক্ষিত।",

    promoDesc: "এই সীমিত সময়ের স্বাগত অফার পেতে এখনই অ্যাকাউন্ট তৈরি করুন।",
    promoButton: "বোনাস নিন",
    promoLater: "পরে দেখব",

    authLoginTitle: "লগইন করুন",
    authRegisterTitle: "অ্যাকাউন্ট তৈরি করুন",
    authLoginSub: "চালিয়ে যেতে আপনার ফোন নম্বর দিন",
    authRegisterSub: "এক মিনিটেরও কম সময়ে অ্যাকাউন্ট তৈরি করুন",
    authPhoneLabel: "ফোন নম্বর",
    authPhonePlaceholder: "+৮৮০ ১৭০০ ০০০০০০",
    authPasswordLabel: "পাসওয়ার্ড",
    authPasswordPlaceholder: "••••••••",
    authConfirmLabel: "পাসওয়ার্ড নিশ্চিত করুন",
    authReferralLabel: "রেফারেল কোড",
    authReferralOptional: "(ঐচ্ছিক)",
    authReferralPlaceholder: "কোড থাকলে এখানে দিন",
    authConsent: "আমার বয়স ১৮+ এবং আমি রাজি",
    authTerms: "নিয়ম ও শর্তাবলী",
    authPrivacy: "গোপনীয়তা নীতি",
    authForgot: "পাসওয়ার্ড ভুলে গেছেন?",
    authLoginBtn: "লগইন",
    authSignupBtn: "নিবন্ধন করুন",
    authHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    authNoAccount: "অ্যাকাউন্ট নেই?",
    authSwitchToLogin: "লগইন করুন",
    authSwitchToSignup: "নিবন্ধন করুন",
    authErrPhone: "সঠিক ফোন নম্বর দিন।",
    authNameLabel: "পূর্ণ নাম",
    authNamePlaceholder: "আপনার পূর্ণ নাম লিখুন",
    authErrName: "আপনার নাম লিখুন।",
    authErrPassword: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    authErrMatch: "পাসওয়ার্ড মিলছে না।",
    authErrTerms: "শর্তাবলীতে সম্মত হন।",
    logout: "লগআউট",
    balance: "ব্যালেন্স",
    myProfile: "আমার প্রোফাইল",
    deposit: "ডিপোজিট",
  },
};

type CtxValue = { lang: Lang; t: Translations; toggle: () => void };
const Ctx = createContext<CtxValue>({ lang: "en", t: T.en, toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <Ctx.Provider value={{ lang, t: T[lang], toggle: () => setLang((l) => (l === "en" ? "bn" : "en")) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
