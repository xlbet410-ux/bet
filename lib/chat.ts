export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: string;
  senderName: string | null;
  body: string;
  createdAt: string;
};

export const CHAT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

export async function createConversation(): Promise<{ id: string }> {
  const res = await fetch(`${CHAT_API_URL}/conversations`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't start a conversation.");
  return res.json();
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${CHAT_API_URL}/conversations/${conversationId}/messages`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't load messages.");
  return res.json();
}

export async function sendMessage(conversationId: string, body: string): Promise<ChatMessage> {
  const res = await fetch(`${CHAT_API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Message failed to send.");
  }
  return res.json();
}

export async function getStreamTicket(conversationId: string): Promise<string> {
  const res = await fetch(`${CHAT_API_URL}/conversations/${conversationId}/stream-ticket`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Couldn't open live connection.");
  const data = await res.json();
  return data.ticket;
}
