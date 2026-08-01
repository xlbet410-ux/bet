"use client";

import { FaChevronUp } from "react-icons/fa6";
import { useScrolled } from "@/lib/hooks";

export default function BackToTop() {
  const visible = useScrolled(480);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#1B0838]/90 text-xl text-[#F5C842] shadow-[0_4px_20px_#00000060] backdrop-blur-sm transition-all duration-300 hover:bg-[#7B2FBE]/40 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <FaChevronUp />
    </button>
  );
}
