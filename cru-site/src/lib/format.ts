import { BCP47, type Locale } from '../i18n/config.ts';

/** Locale-aware single date. */
export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(BCP47[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Date range, collapsing shared parts: "1–2 November 2026" rather than
 * "1 November 2026 – 2 November 2026".
 */
export function formatDateRange(start: Date, end: Date | undefined, locale: Locale): string {
  if (!end || start.getTime() === end.getTime()) return formatDate(start, locale);
  const tag = BCP47[locale];
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    const day = start.toLocaleDateString(tag, { day: 'numeric' });
    return `${day}–${formatDate(end, locale)}`;
  }
  return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}
