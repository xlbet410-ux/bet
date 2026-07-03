"use client";

import { useEffect, useRef, useState } from "react";
import { FaCommentDots, FaXmark, FaPaperPlane, FaHeadset } from "react-icons/fa6";
import { useLang } from "@/lib/language";

type Msg = { from: "agent" | "user"; text: string; time: string };

const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatSupport() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // seed the welcome message the first time the panel opens
  useEffect(() => {
    if (open && !initialised) {
      setMsgs([{ from: "agent", text: t.chatWelcome, time: stamp() }]);
      setInitialised(true);
    }
  }, [open, initialised, t.chatWelcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Msg = { from: "user", text, time: stamp() };
    setMsgs((prev) => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((prev) => [...prev, { from: "agent", text: t.chatAutoReply, time: stamp() }]);
    }, 1400);
  };

  return (
    <>
      {/* floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-[4.5rem] right-4 z-[95] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#9B30FF] to-[#4A0E8F] text-xl text-white shadow-[0_0_28px_#7B2FBE80] transition-all hover:scale-110 sm:bottom-20 sm:right-5"
      >
        {open ? <FaXmark /> : <FaCommentDots />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative h-2.5 w-2.5 rounded-full border-2 border-[#0A0612] bg-green-400" />
          </span>
        )}
      </button>

      {/* chat panel */}
      {open && (
        <div className="fixed bottom-32 right-4 z-[95] flex w-[calc(100vw-32px)] max-w-sm animate-[popIn_0.3s_ease] flex-col overflow-hidden rounded-2xl border border-[#7B2FBE]/40 bg-[#110722] shadow-[0_8px_60px_#7B2FBE55] sm:bottom-36 sm:right-5">

          {/* panel header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#2D0A5E] to-[#1B0838] px-4 py-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9B30FF] to-[#4A0E8F] text-base text-white">
              <FaHeadset />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1B0838] bg-green-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{t.chatTitle}</p>
              <p className="text-[10px] font-medium text-green-400">{t.chatSubtitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-[#9B8EC4] transition-colors hover:text-white"
            >
              <FaXmark />
            </button>
          </div>

          {/* messages */}
          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto px-4 py-4 sm:max-h-72">
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col gap-0.5 ${m.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "rounded-br-sm bg-gradient-to-br from-[#9B30FF] to-[#7B2FBE] text-white"
                      : "rounded-bl-sm bg-white/[0.07] text-[#E5D9FF]"
                  }`}
                >
                  {m.text}
                </div>
                <span className="px-1 text-[10px] text-[#6A5E8A]">{m.time}</span>
              </div>
            ))}

            {/* typing indicator */}
            {typing && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3">
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-[#9B8EC4] animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input row */}
          <div className="flex items-center gap-2 border-t border-white/5 bg-[#0D0820] px-3 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t.chatPlaceholder}
              className="flex-1 min-w-0 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-[#6A5E8A] outline-none transition-colors focus:bg-white/[0.09]"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5C842] text-sm text-[#0A0612] transition-all hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
