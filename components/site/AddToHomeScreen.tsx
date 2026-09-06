"use client";

import { useState, useSyncExternalStore } from "react";
import { useLang } from "@/lib/language";
import {
  canPromptInstall,
  canPromptInstallOnServer,
  isIos,
  isStandalone,
  promptInstall,
  subscribeToInstallPrompt,
} from "@/lib/pwa";

const CARD = {
  background: "linear-gradient(180deg,rgba(43,20,80,.55),rgba(20,8,40,.55))",
  border: "1px solid rgba(123,47,190,.28)",
};

const INNER = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(123,47,190,.22)",
};

/**
 * Profile tab that adds the site to the phone's home screen.
 *
 * Three different realities to cover: Chromium fires an install event we
 * can replay on a button press, iOS Safari offers no API at all so the
 * steps have to be spelled out, and a visitor who already installed it is
 * reading this *inside* the installed app.
 */
export default function AddToHomeScreen() {
  const { t } = useLang();
  const [result, setResult] = useState<"accepted" | "dismissed" | null>(null);

  // Reads through an external store rather than an effect: the value is
  // browser-only, and this keeps the server render (always false) from
  // desyncing hydration.
  const installable = useSyncExternalStore(
    subscribeToInstallPrompt,
    canPromptInstall,
    canPromptInstallOnServer,
  );
  const alreadyInstalled = useSyncExternalStore(
    subscribeToInstallPrompt,
    isStandalone,
    canPromptInstallOnServer,
  );
  const ios = useSyncExternalStore(subscribeToInstallPrompt, isIos, canPromptInstallOnServer);

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome !== "unavailable") setResult(outcome);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6" style={CARD}>
        <div className="mb-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="2XLbet"
            className="h-12 w-12 shrink-0 rounded-xl border border-[#D4AF37]/30 object-cover"
          />
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-white">{t.profileInstallTitle}</h3>
            <p className="text-sm text-[#9B8EC4]">{t.profileInstallDesc}</p>
          </div>
        </div>

        {alreadyInstalled ? (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.3)" }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
              style={{ background: "#22c55e" }}
            >
              ✓
            </span>
            <div>
              <p className="text-xs font-semibold text-green-400">{t.profileInstallDone}</p>
              <p className="text-[11px] text-[#9B8EC4]">{t.profileInstallDoneDesc}</p>
            </div>
          </div>
        ) : ios ? (
          // No install API exists on iOS, so the Share-sheet steps are the
          // only truthful thing to show — the same flow Safari itself uses.
          <div className="rounded-xl p-4" style={INNER}>
            <p className="mb-3 text-xs font-semibold text-[#C9B8E8]">{t.profileInstallIosTitle}</p>
            <ol className="space-y-2.5">
              {[t.profileInstallIosStep1, t.profileInstallIosStep2, t.profileInstallIosStep3].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0A0612]"
                    style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs leading-5 text-[#C9B8E8]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : installable ? (
          <>
            <button
              onClick={handleInstall}
              className="w-full rounded-full py-3.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(to right,#D4AF37,#F5C842)" }}
            >
              {t.profileInstallBtn}
            </button>
            {result === "dismissed" && (
              <p className="mt-3 text-center text-[11px] text-[#9B8EC4]">{t.profileInstallFallback}</p>
            )}
          </>
        ) : (
          // Already-installed browsers, desktop, and anything that never
          // fired the event land here rather than on a button that would
          // do nothing when pressed.
          <p className="rounded-xl px-4 py-3 text-xs leading-5 text-[#9B8EC4]" style={INNER}>
            {t.profileInstallFallback}
          </p>
        )}
      </div>
    </div>
  );
}
