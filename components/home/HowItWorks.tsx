"use client";

import { STEPS } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function HowItWorks() {
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 py-1 sm:py-2">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t.howTitle} <span className="text-[#F5C842]">{t.howHighlight}</span>
          </h2>
          <p className="mt-2 text-[#9B8EC4]">{t.howSub}</p>
        </div>
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="absolute left-1/6 right-1/6 top-8 hidden h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent md:block" />
          {t.steps.map((item, i) => (
            <div key={i} className="relative text-center">
              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#7B2FBE] to-[#4A0E8F] shadow-[0_0_24px_#7B2FBE60]">
                <span
                  className="text-lg font-extrabold text-[#F5C842]"
                  style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                  {STEPS[i].step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#9B8EC4]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
