const ITEM_IMAGE_MAP: Record<string, string> = {
  item_4021: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', // Smartphone X
  item_4022: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', // Wireless Earbuds
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
];

export function getItemImageUrl(itemId: string, name?: string): string {
  if (ITEM_IMAGE_MAP[itemId]) {
    return ITEM_IMAGE_MAP[itemId];
  }

  if (name) {
    const lower = name.toLowerCase();
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('smartphone')) {
      return ITEM_IMAGE_MAP.item_4021;
    }
    if (lower.includes('earbud') || lower.includes('headphone') || lower.includes('audio')) {
      return ITEM_IMAGE_MAP.item_4022;
    }
  }

  // Pick deterministic fallback based on char code sum
  const charSum = itemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_IMAGES[charSum % FALLBACK_IMAGES.length];
}
