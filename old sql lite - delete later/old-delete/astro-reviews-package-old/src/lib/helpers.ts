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
  return { excerpt: `${chars.slice(0, maxChars).join('').trimEnd()}…`, isTruncated: true };
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

/** Map API/platform slug to a display label (e.g. `google` → `Google`). */
export function mapPlatformName(name: string): string {
  const key = name.toLowerCase().trim();
  return platformLabels[key] ?? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Remove simple HTML tags for safe plain-text excerpts. */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ');
}

/** Data URL for a neutral circular placeholder when `reviewerImg` is empty. */
export function getPlaceholderAvatarDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label=""><rect width="80" height="80" rx="40" fill="#e8e8e8"/><circle cx="40" cy="32" r="14" fill="#bdbdbd"/><ellipse cx="40" cy="68" rx="24" ry="18" fill="#bdbdbd"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
