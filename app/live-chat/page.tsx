"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaPaperPlane, FaHeadset } from "react-icons/fa6";
import Header from "@/components/site/Header";
import AuthModal from "@/components/site/AuthModal";
import AmbientBackground from "@/components/site/AmbientBackground";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/language";
import { createConversation, getMessages, sendMessage, getStreamTicket, CHAT_API_URL, type ChatMessage } from "@/lib/chat";

const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function LiveChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLang();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
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

  // set up the conversation + live stream once the player is logged in
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

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
      <AmbientBackground />
      <Header onOpenAuth={(m) => setAuthMode(m)} />
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      )}

      {/* h-dvh, not h-screen — see the play page for why 100vh clips content
          on mobile (message input included) behind the browser's chrome. */}
      <main className="relative z-10 flex h-dvh flex-col pt-16 sm:pt-20">
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#0A0612] px-4 py-2.5 sm:px-5">
          <button
            onClick={() => router.back()}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#C9B8E8] transition-colors hover:border-[#D4AF37]/40 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            <FaArrowLeft className="h-3 w-3" />
            {lang === "bn" ? "ফিরে যান" : "Back"}
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9B30FF] to-[#4A0E8F] text-sm text-white">
              <FaHeadset />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0612] bg-green-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{t.chatTitle}</p>
              <p className="text-[10px] font-medium text-green-400">{t.chatSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-[#C9B8E8]">Please log in to chat with our support team.</p>
              <button
                onClick={() => setAuthMode("login")}
                className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5C842] px-5 py-2.5 text-sm font-bold text-[#0A0612] transition-all hover:scale-105"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
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
              </div>

              <div className="border-t border-white/5 bg-[#0D0820] px-4 py-3 sm:px-6">
                <div className="mx-auto flex max-w-2xl items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={t.chatPlaceholder}
                    className="min-w-0 flex-1 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-[#6A5E8A] outline-none transition-colors focus:bg-white/[0.09]"
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
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
