export type KycStatus = {
  status: "pending" | "verified" | "rejected";
  documentType: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
} | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "2xlbet:token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("You're not logged in.");
  return { Authorization: `Bearer ${token}` };
}

async function parseApiError(res: Response) {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {}
  return "Something went wrong. Please try again.";
}

export async function getMyKyc(): Promise<KycStatus> {
  const res = await fetch(`${API_URL}/kyc/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

export async function submitKyc(
  documentType: string,
  frontDataUrl: string,
  backDataUrl: string,
  selfieDataUrl: string
): Promise<KycStatus> {
  const [front, back, selfie] = await Promise.all([
    dataUrlToBlob(frontDataUrl),
    dataUrlToBlob(backDataUrl),
    dataUrlToBlob(selfieDataUrl),
  ]);

  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("front", front, "front.jpg");
  formData.append("back", back, "back.jpg");
  formData.append("selfie", selfie, "selfie.jpg");

  const res = await fetch(`${API_URL}/kyc`, { method: "POST", headers: authHeaders(), body: formData });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
