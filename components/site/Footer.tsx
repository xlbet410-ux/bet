"use client";

import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="relative z-10 border-t border-[#D4AF37]/15 bg-[#080410] px-5 pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <Image src="/logo.png" alt="2XLbet Casino" width={120} height={120} className="h-12 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9B8EC4]">{t.footerDesc}</p>
            <div className="mt-5 flex gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-base transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {t.footerGroups.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{heading}</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-[#9B8EC4]">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-[#F5C842]">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* responsible gambling strip */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center sm:flex-row sm:text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 text-sm font-bold text-[#F5C842]">
            18+
          </span>
          <p className="max-w-2xl text-xs leading-relaxed text-[#7A6E9C]">{t.footerAge}</p>
        </div>

        <p className="mx-auto mt-8 max-w-6xl border-t border-white/5 py-6 text-center text-xs text-[#5A4F78]">
          {t.footerCopyright}
        </p>
      </div>
    </footer>
  );
}
