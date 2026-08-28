"use client";

import { useState } from "react";
import { FaFacebook, FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa6";

export default function ShareLinkBar({
  link,
  instagramHint,
  variant = "light",
}: {
  link: string;
  instagramHint: string;
  variant?: "light" | "dark";
}) {
  const [showInstagramHint, setShowInstagramHint] = useState(false);

  function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  // Instagram has no public web share-intent for arbitrary links (unlike
  // FB/Telegram/WhatsApp) — copy the link and prompt the player to paste it
  // into their bio/story instead of pointing at a broken URL.
  function handleInstagram() {
    navigator.clipboard.writeText(link).then(() => {
      setShowInstagramHint(true);
      setTimeout(() => setShowInstagramHint(false), 3500);
    });
  }

  const encodedLink = encodeURIComponent(link);
  const dark = variant === "dark";

  return (
    <div className="flex items-center gap-2.5">
      <ShareIconButton
        label="Facebook"
        color="#1877F2"
        dark={dark}
        onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`)}
      >
        <FaFacebook />
      </ShareIconButton>
      <ShareIconButton
        label="Telegram"
        color="#26A5E4"
        dark={dark}
        onClick={() => openShare(`https://t.me/share/url?url=${encodedLink}`)}
      >
        <FaTelegram />
      </ShareIconButton>
      <ShareIconButton
        label="WhatsApp"
        color="#25D366"
        dark={dark}
        onClick={() => openShare(`https://wa.me/?text=${encodedLink}`)}
      >
        <FaWhatsapp />
      </ShareIconButton>
      <div className="relative">
        <ShareIconButton label="Instagram" color="#E1306C" dark={dark} onClick={handleInstagram}>
          <FaInstagram />
        </ShareIconButton>
        {showInstagramHint && (
          <div
            className={`absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 rounded-lg px-2.5 py-2 text-center text-[11px] shadow-lg ${
              dark
                ? "border border-[#7B2FBE]/40 bg-[#1B0838] text-[#C9B8E8]"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {instagramHint}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareIconButton({
  label,
  color,
  dark,
  onClick,
  children,
}: {
  label: string;
  color: string;
  dark: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={`Share via ${label}`}
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-base transition-transform hover:scale-110 ${
        dark ? "border-[#7B2FBE]/40 bg-white/4" : "border-gray-200 bg-white"
      }`}
      style={{ color }}
    >
      {children}
    </button>
  );
}
