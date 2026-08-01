"use client";

import { PAYMENT_METHODS } from "@/lib/data";
import { useLang } from "@/lib/language";

export default function PaymentMethods() {
  const { t } = useLang();

  return (
    <section className="relative z-10 px-5 py-0.5 sm:py-1">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-2 text-xl font-bold text-white">{t.paymentTitle}</h2>
        <p className="mb-8 text-sm text-[#9B8EC4]">{t.paymentSub}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {PAYMENT_METHODS.map((m) => (
            <div
              key={m}
              className="cursor-pointer rounded-xl border border-[#7B2FBE]/30 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[#C9B8E8] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:text-[#F5C842]"
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
