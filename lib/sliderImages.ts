export type SliderImage = {
  id: string;
  imageUrl: string;
  originalName: string;
  sortOrder: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getSliderImages(): Promise<SliderImage[]> {
  const res = await fetch(`${API_URL}/slider-images`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load slider images (${res.status})`);
  return res.json();
}

export function sliderImageUrl(image: SliderImage): string {
  return `${API_URL}${image.imageUrl}`;
}
