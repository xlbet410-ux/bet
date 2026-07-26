export type PromoImage = {
  id: string;
  imageUrl: string;
  originalName: string;
  sortOrder: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getPromoImages(): Promise<PromoImage[]> {
  try {
    const res = await fetch(`${API_URL}/promo-images`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export function promoImageUrl(image: PromoImage): string {
  return `${API_URL}${image.imageUrl}`;
}
