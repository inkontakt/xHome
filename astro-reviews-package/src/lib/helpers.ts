/**
 * Format stored review_time (`YYYY-MM-DD HH:mm:ss`) to fixed `dd/mm/yyyy`.
 */
export function formatDate(isoString: string): string {
  if (!isoString || !isoString.trim()) return '';
  const d = new Date(isoString.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return isoString;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Truncate plain text to a maximum number of characters without splitting Unicode code points.
 * @returns Excerpt text and whether the original was longer than `maxChars`.
 */
export function truncateText(
  text: string,
  maxChars: number,
): { excerpt: string; isTruncated: boolean } {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chars = [...normalized];
  if (chars.length <= maxChars) {
    return { excerpt: normalized, isTruncated: false };
  }
  return { excerpt: `${chars.slice(0, maxChars).join('').trimEnd()}...`, isTruncated: true };
}

export type ReviewContentLanguage = 'original' | 'translated_by_google' | 'all';

/**
 * Match WP Social Ninja's review language switch for Google review payloads.
 */
export function selectReviewContentLanguage(
  text: string,
  language: ReviewContentLanguage = 'original',
): string {
  if (!text || language === 'all') return text;

  const translatedMarker = '(Translated by Google)';
  const originalMarker = '(Original)';
  const translatedIndex = text.indexOf(translatedMarker);
  const originalIndex = text.indexOf(originalMarker);

  if (originalIndex !== -1) {
    const [translatedPart = '', originalPart = ''] = text.split(originalMarker);
    if (language === 'translated_by_google') {
      return translatedPart.replace(translatedMarker, '');
    }
    return originalPart;
  }

  if (translatedIndex !== -1) {
    const [originalPart = '', translatedPart = ''] = text.split(translatedMarker);
    return language === 'translated_by_google' ? translatedPart : originalPart;
  }

  return text;
}

/** Decode HTML numeric/named entities commonly stored by WordPress for emojis and punctuation. */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  const decodedNumeric = text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const point = Number.parseInt(hex, 16);
      return Number.isFinite(point) ? String.fromCodePoint(point) : _;
    })
    .replace(/&#(\d+);/g, (_, decimal: string) => {
      const point = Number.parseInt(decimal, 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : _;
    });

  return decodedNumeric
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/** Repair loose JSON unicode escapes such as `ud83dudc4d` when they were stored without slashes. */
export function decodeLooseUnicodeEscapes(text: string): string {
  if (!text) return '';

  return text.replace(/u([0-9a-f]{4})u([0-9a-f]{4})/gi, (match, highHex: string, lowHex: string) => {
    const high = Number.parseInt(highHex, 16);
    const low = Number.parseInt(lowHex, 16);
    if (high >= 0xd800 && high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff) {
      const point = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00);
      return String.fromCodePoint(point);
    }
    return match;
  });
}

const platformLabels: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  yelp: 'Yelp',
  tripadvisor: 'Tripadvisor',
  trustpilot: 'Trustpilot',
  airbnb: 'Airbnb',
  amazon: 'Amazon',
  booking: 'Booking.com',
  'booking.com': 'Booking.com',
};

/** Map API/platform slug to a display label (e.g. `google` -> `Google`). */
export function mapPlatformName(name: string): string {
  const key = name.toLowerCase().trim();
  return platformLabels[key] ?? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Remove simple HTML tags for safe plain-text excerpts. */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ');
}

/** Prepare stored WP Social Ninja review text for the plain-text Astro card preview. */
export function getReviewPreviewText(
  text: string,
  language: ReviewContentLanguage = 'original',
): string {
  const selected = selectReviewContentLanguage(text, language);
  const withoutHtml = stripHtml(selected);
  const decoded = decodeLooseUnicodeEscapes(decodeHtmlEntities(withoutHtml));
  return stripHtml(decoded).replace(/\s+/g, ' ').trim();
}

/** Data URL for a neutral circular placeholder when `reviewerImg` is empty. */
export function getPlaceholderAvatarDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label=""><rect width="80" height="80" rx="40" fill="#e8e8e8"/><circle cx="40" cy="32" r="14" fill="#bdbdbd"/><ellipse cx="40" cy="68" rx="24" ry="18" fill="#bdbdbd"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
