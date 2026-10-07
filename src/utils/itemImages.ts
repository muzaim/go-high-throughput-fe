const ITEM_IMAGE_MAP: Record<string, string> = {
  item_4021: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', // iPhone 18 Pro Max
  item_4022: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', // MacBook Pro M4 Max
  item_4023: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', // iPad Pro OLED
  item_4024: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', // Apple Watch Ultra 3
  item_4025: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', // AirPods Max 2
  item_4026: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', // PlayStation 5 Pro
  item_4027: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', // LG UltraGear OLED Monitor
  item_4028: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', // Custom Mechanical Keyboard
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
    if (lower.includes('iphone') || lower.includes('phone') || lower.includes('smartphone')) {
      return ITEM_IMAGE_MAP.item_4021;
    }
    if (lower.includes('macbook') || lower.includes('laptop')) {
      return ITEM_IMAGE_MAP.item_4022;
    }
    if (lower.includes('ipad') || lower.includes('tablet')) {
      return ITEM_IMAGE_MAP.item_4023;
    }
    if (lower.includes('watch') || lower.includes('clock')) {
      return ITEM_IMAGE_MAP.item_4024;
    }
    if (lower.includes('airpods') || lower.includes('headphone') || lower.includes('earbud')) {
      return ITEM_IMAGE_MAP.item_4025;
    }
    if (lower.includes('playstation') || lower.includes('ps5') || lower.includes('console')) {
      return ITEM_IMAGE_MAP.item_4026;
    }
    if (lower.includes('monitor') || lower.includes('display') || lower.includes('screen')) {
      return ITEM_IMAGE_MAP.item_4027;
    }
    if (lower.includes('keyboard') || lower.includes('keycap')) {
      return ITEM_IMAGE_MAP.item_4028;
    }
  }

  // Pick deterministic fallback based on char code sum
  const charSum = itemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_IMAGES[charSum % FALLBACK_IMAGES.length];
}
