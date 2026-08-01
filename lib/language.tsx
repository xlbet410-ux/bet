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

  // mobile bottom nav bar
  bottomNavHome: string;
  bottomNavPromotion: string;
  bottomNavServices: string;
  bottomNavMember: string;

  // profile page
  profileHome: string;
  profileVerified: string;
  profileTabProfile: string;
  profileTabWallet: string;
  profileTabWithdraw: string;
  profileTabSettings: string;
  profileTabKyc: string;
  profileDepositModalTitle: string;
  profileSendMoneyTo: string;
  profileCopy: string;
  profileCopied: string;
  profileSendInstructions: string;
  profileTrxIdLabel: string;
  profileTrxIdPlaceholder: string;
  profileConfirmDeposit: string;
  profileRequestSubmittedTitle: string;
  profileRequestSubmittedDesc: string;
  profileDone: string;
  profileDepositBubble: string;
  profileDepositSubmittedShort: string;
  profileAccountDetails: string;
  profileLabelFullName: string;
  profileLabelPhone: string;
  profileLabelAccountId: string;
  profileLabelMemberSince: string;
  profileLabelAccountLevel: string;
  profileLabelStatus: string;
  profileValueStandardPlayer: string;
  profileActive: string;
  profileAvailableToPlay: string;
  profileRecentTransactions: string;
  profileStatusCompleted: string;
  profileStatusPending: string;
  profileMakeDeposit: string;
  profilePaymentMethod: string;
  profileQuickAmount: string;
  profileCustomAmount: string;
  profileEnterAmountPlaceholder: string;
  profileNow: string;
  profileErrSelectAmount: string;
  profileDepositFootnote: string;
  profileWithdrawFunds: string;
  profileWithdrawMethod: string;
  profileWithdrawFootnote: string;
  profileUpdatePasswordTitle: string;
  profileUpdatePasswordDesc: string;
  profileCurrentPasswordLabel: string;
  profileCurrentPasswordPlaceholder: string;
  profileNewPasswordLabel: string;
  profileNewPasswordPlaceholder: string;
  profileConfirmPasswordLabel: string;
  profileConfirmPasswordPlaceholder: string;
  profileErrEnterCurrentPwd: string;
  profileErrNewPwdLength: string;
  profileErrPwdMismatch: string;
  profilePwdUpdateSuccess: string;
  profileErrGeneric: string;
  profileUpdatePasswordBtn: string;
  profileUpdatingBtn: string;
  profileShareEarnTitle: string;
  profileShareEarnDesc: string;
  profileReferralCodeLabel: string;
  profileReferralLinkLabel: string;
  profileCopyLink: string;
  profileKycLoading: string;
  profileKycVerifiedTitle: string;
  profileKycVerifiedDesc: string;
  profileKycChecklist: string[];
  profileKycPendingTitle: string;
  profileKycPendingDesc1: string;
  profileKycPendingDesc2: string;
  profileKycRejectedTitle: string;
  profileTryAgain: string;
  profileKycStartTitle: string;
  profileKycStartDesc: string;
  profileKycStartNote: string;
  profileKycStartSteps: string[];
  profileKycStartBtn: string;
  profileKycStepLabels: string[];
  profileKycPhoneTitle: string;
  profileKycPhoneDesc: string;
  profileKycPhonePlaceholder: string;
  profileSendOtp: string;
  profileKycOtpTitle: string;
  profileKycOtpSentTo: string;
  profileKycOtpDemo: string;
  profileVerifyOtp: string;
  profileChangePhone: string;
  profileKycDocTypeTitle: string;
  profileKycDocTypeDesc: string;
  profileDocTypeLabels: string[];
  profileContinue: string;
  profileKycReviewTitle: string;
  profileKycReviewDesc: string;
  profileRetakeFront: string;
  profileRetakeBack: string;
  profileContinueToSelfie: string;
  profileCaptureFrontTitle: string;
  profileCaptureBackTitle: string;
  profilePositionFrontDesc: string;
  profilePositionBackDesc: string;
  profileStepXOf2: string;
  profileCamError: string;
  profileCaptured: string;
  profileFitDocument: string;
  profileUseThisPhotoContinue: string;
  profileUseThisPhoto: string;
  profileRetakePhoto: string;
  profileCapturePhoto: string;
  profileKycSelfieTitle: string;
  profileKycSelfieDesc: string;
  profilePositionFace: string;
  profileSubmitting: string;
  profileSubmitVerification: string;

  // game category labels (keyed by GameCategory from lib/games.ts)
  categoryLabels: {
    featured: string;
    slots: string;
    live_casino: string;
    cards: string;
    fishing: string;
    mini_games: string;
    sports: string;
  };

  // sub-tag filter chips (only within Slots today — see lib/games.ts SUB_TAGS)
  subTagAll: string;
  subTagMegaways: string;
  subTagJackpot: string;
  subTagTableGames: string;
  subTagVideoPoker: string;
  subTagCrashGames: string;
  subTagArcade: string;
  subTagBingo: string;
  subTagScratches: string;
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

    bottomNavHome: "Home",
    bottomNavPromotion: "Promotion",
    bottomNavServices: "Services",
    bottomNavMember: "Member",

    profileHome: "Home",
    profileVerified: "Verified",
    profileTabProfile: "Profile",
    profileTabWallet: "Wallet",
    profileTabWithdraw: "Withdraw",
    profileTabSettings: "Settings",
    profileTabKyc: "KYC",
    profileDepositModalTitle: "Complete Your Deposit",
    profileSendMoneyTo: "Send Money To",
    profileCopy: "Copy",
    profileCopied: "Copied!",
    profileSendInstructions: "Send ৳{amount} to the {method} number above, then enter the Transaction ID (TrxID) you received below to confirm your deposit.",
    profileTrxIdLabel: "Transaction ID",
    profileTrxIdPlaceholder: "e.g. 8N7QK3PLXD",
    profileConfirmDeposit: "Confirm Deposit",
    profileRequestSubmittedTitle: "Request Submitted",
    profileRequestSubmittedDesc: "Your deposit of ৳{amount} is pending verification. This usually takes a few minutes.",
    profileDone: "Done",
    profileDepositBubble: "Deposit ৳{amount}",
    profileDepositSubmittedShort: "Deposit submitted",
    profileAccountDetails: "Account Details",
    profileLabelFullName: "Full Name",
    profileLabelPhone: "Phone Number",
    profileLabelAccountId: "Account ID",
    profileLabelMemberSince: "Member Since",
    profileLabelAccountLevel: "Account Level",
    profileLabelStatus: "Status",
    profileValueStandardPlayer: "Standard Player",
    profileActive: "Active",
    profileAvailableToPlay: "Available to play",
    profileRecentTransactions: "Recent Transactions",
    profileStatusCompleted: "completed",
    profileStatusPending: "pending",
    profileMakeDeposit: "Make a Deposit",
    profilePaymentMethod: "Payment Method",
    profileQuickAmount: "Quick Amount",
    profileCustomAmount: "Custom Amount",
    profileEnterAmountPlaceholder: "Enter amount",
    profileNow: "Now",
    profileErrSelectAmount: "Please select or enter an amount first.",
    profileDepositFootnote: "Minimum ৳100 · SSL encrypted · Instant processing",
    profileWithdrawFunds: "Withdraw Funds",
    profileWithdrawMethod: "Withdraw Method",
    profileWithdrawFootnote: "Minimum ৳100 · KYC required · Processed within 24 hours",
    profileUpdatePasswordTitle: "Update Password",
    profileUpdatePasswordDesc: "Change the password you use to log in to your account.",
    profileCurrentPasswordLabel: "Current Password",
    profileCurrentPasswordPlaceholder: "Enter current password",
    profileNewPasswordLabel: "New Password",
    profileNewPasswordPlaceholder: "At least 6 characters",
    profileConfirmPasswordLabel: "Confirm New Password",
    profileConfirmPasswordPlaceholder: "Re-enter new password",
    profileErrEnterCurrentPwd: "Enter your current password.",
    profileErrNewPwdLength: "New password must be at least 6 characters.",
    profileErrPwdMismatch: "New passwords do not match.",
    profilePwdUpdateSuccess: "Password updated successfully.",
    profileErrGeneric: "Something went wrong. Please try again.",
    profileUpdatePasswordBtn: "Update Password",
    profileUpdatingBtn: "Updating...",
    profileShareEarnTitle: "Share & Earn",
    profileShareEarnDesc: "Invite friends with your referral code and earn rewards when they join.",
    profileReferralCodeLabel: "Your Referral Code",
    profileReferralLinkLabel: "Your Referral Link",
    profileCopyLink: "Copy Link",
    profileKycLoading: "Loading verification status…",
    profileKycVerifiedTitle: "You Are Verified!",
    profileKycVerifiedDesc: "Your identity has been successfully verified. You have full access to all features.",
    profileKycChecklist: ["Phone Verified", "ID Verified", "Address Verified", "Selfie Verified"],
    profileKycPendingTitle: "Verification Under Review",
    profileKycPendingDesc1: "We've received your {doc} and selfie.",
    profileKycPendingDesc2: "Our team typically reviews submissions within 24 hours. You'll see the result here.",
    profileKycRejectedTitle: "Verification Rejected",
    profileTryAgain: "Try Again",
    profileKycStartTitle: "Identity Verification",
    profileKycStartDesc: "Verify your identity to unlock withdrawals and higher betting limits.",
    profileKycStartNote: "Takes about 3 minutes · Your data is encrypted and secure",
    profileKycStartSteps: ["Phone number verification", "Government-issued ID upload", "Address proof upload", "Face selfie with ID"],
    profileKycStartBtn: "Start Verification",
    profileKycStepLabels: ["Phone", "OTP", "Document", "Upload", "Selfie"],
    profileKycPhoneTitle: "Verify Phone Number",
    profileKycPhoneDesc: "Enter the phone number linked to your account.",
    profileKycPhonePlaceholder: "Enter phone number",
    profileSendOtp: "Send OTP",
    profileKycOtpTitle: "Enter OTP",
    profileKycOtpSentTo: "A 6-digit code was sent to",
    profileKycOtpDemo: "(Demo: any 6 digits accepted)",
    profileVerifyOtp: "Verify OTP",
    profileChangePhone: "← Change phone number",
    profileKycDocTypeTitle: "Choose Document Type",
    profileKycDocTypeDesc: "Select the document you will upload for identity verification.",
    profileDocTypeLabels: ["National ID", "Passport", "Driver's License"],
    profileContinue: "Continue",
    profileKycReviewTitle: "Review Your Document",
    profileKycReviewDesc: "Both sides of your {doc} look good? Continue, or retake either side.",
    profileRetakeFront: "Retake front",
    profileRetakeBack: "Retake back",
    profileContinueToSelfie: "Continue to Selfie",
    profileCaptureFrontTitle: "Capture Front Side",
    profileCaptureBackTitle: "Capture Back Side",
    profilePositionFrontDesc: "Position the front of your {doc} inside the frame.",
    profilePositionBackDesc: "Position the back of your {doc} inside the frame.",
    profileStepXOf2: "Step {n} of 2",
    profileCamError: "Camera permission denied. Please allow camera access in your browser.",
    profileCaptured: "Captured",
    profileFitDocument: "Fit the document inside the frame",
    profileUseThisPhotoContinue: "Use This Photo — Continue to Back",
    profileUseThisPhoto: "Use This Photo",
    profileRetakePhoto: "Retake photo",
    profileCapturePhoto: "Capture Photo",
    profileKycSelfieTitle: "Take a Selfie",
    profileKycSelfieDesc: "Hold your {doc} next to your face and look at the camera.",
    profilePositionFace: "Position your face inside the oval",
    profileSubmitting: "Submitting…",
    profileSubmitVerification: "Submit Verification",

    categoryLabels: {
      featured: "Featured",
      slots: "Slots",
      live_casino: "Live Casino",
      cards: "Cards",
      fishing: "Fishing",
      mini_games: "Mini Games",
      sports: "Sports",
    },

    subTagAll: "All",
    subTagMegaways: "Megaways",
    subTagJackpot: "Jackpot",
    subTagTableGames: "Table Games",
    subTagVideoPoker: "Video Poker",
    subTagCrashGames: "Crash Games",
    subTagArcade: "Arcade",
    subTagBingo: "Bingo",
    subTagScratches: "Scratches",
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

    bottomNavHome: "হোম",
    bottomNavPromotion: "প্রমোশন",
    bottomNavServices: "সার্ভিস",
    bottomNavMember: "মেম্বার",

    profileHome: "হোম",
    profileVerified: "ভেরিফাইড",
    profileTabProfile: "প্রোফাইল",
    profileTabWallet: "ওয়ালেট",
    profileTabWithdraw: "উত্তোলন",
    profileTabSettings: "সেটিংস",
    profileTabKyc: "কেওয়াইসি",
    profileDepositModalTitle: "আপনার ডিপোজিট সম্পন্ন করুন",
    profileSendMoneyTo: "টাকা পাঠান এখানে",
    profileCopy: "কপি",
    profileCopied: "কপি হয়েছে!",
    profileSendInstructions: "উপরের {method} নম্বরে ৳{amount} পাঠান, তারপর আপনার ডিপোজিট নিশ্চিত করতে নিচে ট্রানজেকশন আইডি (TrxID) লিখুন।",
    profileTrxIdLabel: "ট্রানজেকশন আইডি",
    profileTrxIdPlaceholder: "যেমন: 8N7QK3PLXD",
    profileConfirmDeposit: "ডিপোজিট নিশ্চিত করুন",
    profileRequestSubmittedTitle: "অনুরোধ জমা হয়েছে",
    profileRequestSubmittedDesc: "আপনার ৳{amount} ডিপোজিট যাচাইয়ের অপেক্ষায় আছে। সাধারণত এতে কয়েক মিনিট সময় লাগে।",
    profileDone: "সম্পন্ন",
    profileDepositBubble: "ডিপোজিট ৳{amount}",
    profileDepositSubmittedShort: "ডিপোজিট জমা হয়েছে",
    profileAccountDetails: "অ্যাকাউন্ট বিবরণ",
    profileLabelFullName: "পুরো নাম",
    profileLabelPhone: "ফোন নম্বর",
    profileLabelAccountId: "অ্যাকাউন্ট আইডি",
    profileLabelMemberSince: "সদস্য হয়েছেন",
    profileLabelAccountLevel: "অ্যাকাউন্ট লেভেল",
    profileLabelStatus: "স্ট্যাটাস",
    profileValueStandardPlayer: "স্ট্যান্ডার্ড প্লেয়ার",
    profileActive: "সক্রিয়",
    profileAvailableToPlay: "খেলার জন্য উপলব্ধ",
    profileRecentTransactions: "সাম্প্রতিক লেনদেন",
    profileStatusCompleted: "সম্পন্ন",
    profileStatusPending: "অপেক্ষমান",
    profileMakeDeposit: "ডিপোজিট করুন",
    profilePaymentMethod: "পেমেন্ট পদ্ধতি",
    profileQuickAmount: "দ্রুত পরিমাণ",
    profileCustomAmount: "নিজের পরিমাণ",
    profileEnterAmountPlaceholder: "পরিমাণ লিখুন",
    profileNow: "এখন",
    profileErrSelectAmount: "প্রথমে একটি পরিমাণ নির্বাচন করুন বা লিখুন।",
    profileDepositFootnote: "সর্বনিম্ন ৳১০০ · SSL এনক্রিপ্টেড · তাৎক্ষণিক প্রসেসিং",
    profileWithdrawFunds: "টাকা উত্তোলন করুন",
    profileWithdrawMethod: "উত্তোলন পদ্ধতি",
    profileWithdrawFootnote: "সর্বনিম্ন ৳১০০ · কেওয়াইসি প্রয়োজন · ২৪ ঘণ্টার মধ্যে প্রসেস হবে",
    profileUpdatePasswordTitle: "পাসওয়ার্ড আপডেট করুন",
    profileUpdatePasswordDesc: "আপনার অ্যাকাউন্টে লগইন করার পাসওয়ার্ড পরিবর্তন করুন।",
    profileCurrentPasswordLabel: "বর্তমান পাসওয়ার্ড",
    profileCurrentPasswordPlaceholder: "বর্তমান পাসওয়ার্ড লিখুন",
    profileNewPasswordLabel: "নতুন পাসওয়ার্ড",
    profileNewPasswordPlaceholder: "কমপক্ষে ৬ অক্ষর",
    profileConfirmPasswordLabel: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    profileConfirmPasswordPlaceholder: "নতুন পাসওয়ার্ড আবার লিখুন",
    profileErrEnterCurrentPwd: "আপনার বর্তমান পাসওয়ার্ড লিখুন।",
    profileErrNewPwdLength: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    profileErrPwdMismatch: "নতুন পাসওয়ার্ড দুটি মিলছে না।",
    profilePwdUpdateSuccess: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।",
    profileErrGeneric: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    profileUpdatePasswordBtn: "পাসওয়ার্ড আপডেট করুন",
    profileUpdatingBtn: "আপডেট হচ্ছে...",
    profileShareEarnTitle: "শেয়ার করুন ও আয় করুন",
    profileShareEarnDesc: "আপনার রেফারেল কোড দিয়ে বন্ধুদের আমন্ত্রণ জানান এবং তারা যোগ দিলে পুরস্কার পান।",
    profileReferralCodeLabel: "আপনার রেফারেল কোড",
    profileReferralLinkLabel: "আপনার রেফারেল লিংক",
    profileCopyLink: "লিংক কপি করুন",
    profileKycLoading: "ভেরিফিকেশন স্ট্যাটাস লোড হচ্ছে…",
    profileKycVerifiedTitle: "আপনি ভেরিফাইড!",
    profileKycVerifiedDesc: "আপনার পরিচয় সফলভাবে যাচাই করা হয়েছে। আপনি সব ফিচারে সম্পূর্ণ প্রবেশাধিকার পেয়েছেন।",
    profileKycChecklist: ["ফোন ভেরিফাইড", "আইডি ভেরিফাইড", "ঠিকানা ভেরিফাইড", "সেলফি ভেরিফাইড"],
    profileKycPendingTitle: "ভেরিফিকেশন পর্যালোচনাধীন",
    profileKycPendingDesc1: "আমরা আপনার {doc} এবং সেলফি পেয়েছি।",
    profileKycPendingDesc2: "আমাদের টিম সাধারণত ২৪ ঘণ্টার মধ্যে জমা পর্যালোচনা করে। ফলাফল এখানে দেখতে পাবেন।",
    profileKycRejectedTitle: "ভেরিফিকেশন প্রত্যাখ্যাত",
    profileTryAgain: "আবার চেষ্টা করুন",
    profileKycStartTitle: "পরিচয় যাচাই",
    profileKycStartDesc: "উত্তোলন এবং উচ্চতর বেটিং লিমিট আনলক করতে আপনার পরিচয় যাচাই করুন।",
    profileKycStartNote: "প্রায় ৩ মিনিট সময় লাগে · আপনার তথ্য এনক্রিপ্টেড ও নিরাপদ",
    profileKycStartSteps: ["ফোন নম্বর যাচাই", "সরকার অনুমোদিত আইডি আপলোড", "ঠিকানার প্রমাণ আপলোড", "আইডিসহ সেলফি"],
    profileKycStartBtn: "ভেরিফিকেশন শুরু করুন",
    profileKycStepLabels: ["ফোন", "ওটিপি", "ডকুমেন্ট", "আপলোড", "সেলফি"],
    profileKycPhoneTitle: "ফোন নম্বর যাচাই করুন",
    profileKycPhoneDesc: "আপনার অ্যাকাউন্টের সাথে যুক্ত ফোন নম্বর লিখুন।",
    profileKycPhonePlaceholder: "ফোন নম্বর লিখুন",
    profileSendOtp: "ওটিপি পাঠান",
    profileKycOtpTitle: "ওটিপি লিখুন",
    profileKycOtpSentTo: "৬ সংখ্যার কোড পাঠানো হয়েছে",
    profileKycOtpDemo: "(ডেমো: যেকোনো ৬ সংখ্যা গ্রহণযোগ্য)",
    profileVerifyOtp: "ওটিপি যাচাই করুন",
    profileChangePhone: "← ফোন নম্বর পরিবর্তন করুন",
    profileKycDocTypeTitle: "ডকুমেন্টের ধরন নির্বাচন করুন",
    profileKycDocTypeDesc: "পরিচয় যাচাইয়ের জন্য আপনি যে ডকুমেন্ট আপলোড করবেন তা নির্বাচন করুন।",
    profileDocTypeLabels: ["জাতীয় পরিচয়পত্র", "পাসপোর্ট", "ড্রাইভিং লাইসেন্স"],
    profileContinue: "চালিয়ে যান",
    profileKycReviewTitle: "আপনার ডকুমেন্ট পর্যালোচনা করুন",
    profileKycReviewDesc: "আপনার {doc}-এর দুই পাশই ঠিক আছে? চালিয়ে যান, অথবা যেকোনো পাশ আবার তুলুন।",
    profileRetakeFront: "সামনের পাশ আবার তুলুন",
    profileRetakeBack: "পেছনের পাশ আবার তুলুন",
    profileContinueToSelfie: "সেলফিতে চালিয়ে যান",
    profileCaptureFrontTitle: "সামনের পাশ ক্যাপচার করুন",
    profileCaptureBackTitle: "পেছনের পাশ ক্যাপচার করুন",
    profilePositionFrontDesc: "আপনার {doc}-এর সামনের পাশ ফ্রেমের ভেতরে রাখুন।",
    profilePositionBackDesc: "আপনার {doc}-এর পেছনের পাশ ফ্রেমের ভেতরে রাখুন।",
    profileStepXOf2: "ধাপ {n} / ২",
    profileCamError: "ক্যামেরা অনুমতি প্রত্যাখ্যাত হয়েছে। আপনার ব্রাউজারে ক্যামেরা অ্যাক্সেসের অনুমতি দিন।",
    profileCaptured: "ক্যাপচার হয়েছে",
    profileFitDocument: "ডকুমেন্টটি ফ্রেমের ভেতরে রাখুন",
    profileUseThisPhotoContinue: "এই ছবি ব্যবহার করুন — পেছনের পাশে যান",
    profileUseThisPhoto: "এই ছবি ব্যবহার করুন",
    profileRetakePhoto: "ছবি আবার তুলুন",
    profileCapturePhoto: "ছবি ক্যাপচার করুন",
    profileKycSelfieTitle: "একটি সেলফি তুলুন",
    profileKycSelfieDesc: "আপনার {doc} মুখের পাশে ধরুন এবং ক্যামেরার দিকে তাকান।",
    profilePositionFace: "আপনার মুখ ডিম্বাকৃতির ভেতরে রাখুন",
    profileSubmitting: "জমা হচ্ছে…",
    profileSubmitVerification: "ভেরিফিকেশন জমা দিন",

    categoryLabels: {
      featured: "সেরা",
      slots: "স্লট",
      live_casino: "লাইভ",
      cards: "তাস",
      fishing: "মাছ ধরা",
      mini_games: "মিনি গেমস",
      sports: "খেলাধুলা",
    },

    subTagAll: "সব",
    subTagMegaways: "মেগাওয়েজ",
    subTagJackpot: "জ্যাকপট",
    subTagTableGames: "টেবিল গেমস",
    subTagVideoPoker: "ভিডিও পোকার",
    subTagCrashGames: "ক্র্যাশ গেমস",
    subTagArcade: "আর্কেড",
    subTagBingo: "বিঙ্গো",
    subTagScratches: "স্ক্র্যাচ",
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
