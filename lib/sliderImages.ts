export type SliderImage = {
  id: string;
  imageUrl: string;
  originalName: string;
  sortOrder: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getSliderImages(): Promise<SliderImage[]> {
  try {
    const res = await fetch(`${API_URL}/slider-images`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export function sliderImageUrl(image: SliderImage): string {
  return `${API_URL}${image.imageUrl}`;
}
