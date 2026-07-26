"use client";

import { useEffect, useRef, useState } from "react";
import { FaCommentDots, FaXmark, FaPaperPlane, FaHeadset } from "react-icons/fa6";
import { useLang } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { createConversation, getMessages, sendMessage, getStreamTicket, CHAT_API_URL, type ChatMessage } from "@/lib/chat";

const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatSupport({ onOpenAuth }: { onOpenAuth: (mode: "login" | "register") => void }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const conversationIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  // set up the conversation + live stream once the panel is open and the player is logged in
  useEffect(() => {
    if (!open || !user) return;
    stoppedRef.current = false;
    let cancelled = false;

    async function connectStream(id: string) {
      if (stoppedRef.current) return;
      try {
        const ticket = await getStreamTicket(id);
        if (stoppedRef.current || cancelled) return;
        const es = new EventSource(`${CHAT_API_URL}/conversations/${id}/stream?ticket=${ticket}`);
        esRef.current = es;
        es.onmessage = (event) => {
          const message = JSON.parse(event.data) as ChatMessage;
          setMsgs((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        };
        es.onerror = () => {
          es.close();
          if (!stoppedRef.current) reconnectTimer.current = setTimeout(() => connectStream(id), 2000);
        };
      } catch {
        if (!stoppedRef.current) reconnectTimer.current = setTimeout(() => connectStream(id), 3000);
      }
    }

    async function init() {
      setConnecting(true);
      setError("");
      try {
        const { id } = await createConversation();
        if (cancelled) return;
        conversationIdRef.current = id;
        setMsgs(await getMessages(id));
        connectStream(id);
      } catch {
        if (!cancelled) setError("Couldn't connect to support. Please try again.");
      } finally {
        if (!cancelled) setConnecting(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      stoppedRef.current = true;
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [open, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    const conversationId = conversationIdRef.current;
    if (!text || !conversationId || sending) return;

    setSending(true);
    setError("");
    try {
      const message = await sendMessage(conversationId, text);
      setMsgs((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message failed to send.");
    } finally {
      setSending(false);
    }
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

          {!user ? (
            /* login required */
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <p className="text-sm text-[#C9B8E8]">Please log in to chat with our support team.</p>
              <button
                onClick={() => { setOpen(false); onOpenAuth("login"); }}
                className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] px-5 py-2.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-105"
              >
                Log In
              </button>
            </div>
          ) : (
            <>
              {/* messages */}
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto px-4 py-4 sm:max-h-72">
                {connecting && <p className="text-center text-xs text-[#6A5E8A]">Connecting…</p>}

                {msgs.map((m) => (
                  <div key={m.id} className={`flex flex-col gap-0.5 ${m.senderType === "player" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.senderType === "player"
                          ? "rounded-br-sm bg-gradient-to-br from-[#9B30FF] to-[#7B2FBE] text-white"
                          : "rounded-bl-sm bg-white/[0.07] text-[#E5D9FF]"
                      }`}
                    >
                      {m.body}
                    </div>
                    <span className="px-1 text-[10px] text-[#6A5E8A]">{fmt(m.createdAt)}</span>
                  </div>
                ))}

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">{error}</p>
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
                  disabled={!input.trim() || sending}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5C842] text-sm text-[#0A0612] transition-all hover:scale-110 disabled:opacity-40"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
