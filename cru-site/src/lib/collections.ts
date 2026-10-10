import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config.ts';

/** Drafts are visible while developing and hidden in production builds. */
const HIDE_DRAFTS = import.meta.env.PROD;

export interface Localised<K extends CollectionKey> {
  /** Slug without the locale prefix, e.g. 'cru-magazine'. */
  slug: string;
  entry: CollectionEntry<K>;
  /** The locale actually rendered -- differs from the request when falling back. */
  renderedLocale: Locale;
  /** True when the requested locale had no entry and English is being shown. */
  isFallback: boolean;
}

function splitId(id: string): { locale: Locale; slug: string } {
  const i = id.indexOf('/');
  return { locale: id.slice(0, i) as Locale, slug: id.slice(i + 1) };
}

function isDraft(entry: { data: Record<string, unknown> }): boolean {
  return entry.data.draft === true;
}

/**
 * The canonical route set: slugs present in the DEFAULT locale.
 *
 * Driving routes from one locale is what keeps the three language trees
 * identical, which in turn is what makes the hreflang set reciprocal -- every
 * page can promise that its alternates exist.
 */
export async function slugsOf<K extends CollectionKey>(collection: K): Promise<string[]> {
  const all = await getCollection(collection);
  return all
    .filter((e) => splitId(e.id).locale === DEFAULT_LOCALE)
    .filter((e) => !(HIDE_DRAFTS && isDraft(e)))
    .map((e) => splitId(e.id).slug)
    .sort();
}

/** Every entry for `locale`, falling back to the default locale per slug. */
export async function localisedEntries<K extends CollectionKey>(
  collection: K,
  locale: Locale,
): Promise<Localised<K>[]> {
  const all = await getCollection(collection);
  const byId = new Map(all.map((e) => [e.id, e]));
  const slugs = await slugsOf(collection);

  return slugs.flatMap((slug) => {
    const wanted = byId.get(`${locale}/${slug}`);
    const base = byId.get(`${DEFAULT_LOCALE}/${slug}`);
    const entry = wanted ?? base;
    if (!entry) return [];
    return [
      {
        slug,
        entry,
        renderedLocale: wanted ? locale : DEFAULT_LOCALE,
        isFallback: !wanted,
      },
    ];
  });
}

export async function localisedEntry<K extends CollectionKey>(
  collection: K,
  locale: Locale,
  slug: string,
): Promise<Localised<K> | undefined> {
  const entries = await localisedEntries(collection, locale);
  return entries.find((e) => e.slug === slug);
}

/** Brands, ordered by their `order` field then title. */
export async function brandsFor(locale: Locale) {
  const brands = await localisedEntries('brands', locale);
  return brands.sort(
    (a, b) =>
      a.entry.data.order - b.entry.data.order ||
      a.entry.data.title.localeCompare(b.entry.data.title),
  );
}

export type EventStatus = 'upcoming' | 'past';

/**
 * Derived at build time rather than authored.
 *
 * Caveat inherent to a static site: an event only moves from upcoming to past
 * when the site is rebuilt. The deploy workflow therefore carries a nightly
 * scheduled build -- without it, a finished event would sit under "Upcoming"
 * until the next content change.
 */
export function eventStatus(
  data: CollectionEntry<'events'>['data'],
  now: Date = new Date(),
): EventStatus {
  if (data.statusOverride) return data.statusOverride;
  const end = data.endDate ?? data.startDate;
  // Hong Kong is UTC+8; +32h keeps the whole final day counted as live.
  return end.getTime() + 32 * 60 * 60 * 1000 >= now.getTime() ? 'upcoming' : 'past';
}

export async function eventsByStatus(locale: Locale) {
  const all = await localisedEntries('events', locale);
  const withStatus = all.map((e) => ({ ...e, status: eventStatus(e.entry.data) }));
  return {
    upcoming: withStatus
      .filter((e) => e.status === 'upcoming')
      .sort((a, b) => +a.entry.data.startDate - +b.entry.data.startDate),
    past: withStatus
      .filter((e) => e.status === 'past')
      .sort((a, b) => +b.entry.data.startDate - +a.entry.data.startDate),
  };
}

/** Issues for a brand, newest first. */
export async function issuesForBrand(locale: Locale, brandSlug: string) {
  const issues = await localisedEntries('issues', locale);
  return issues
    .filter((i) => i.entry.data.brandSlug === brandSlug)
    .sort((a, b) => +b.entry.data.publishedAt - +a.entry.data.publishedAt);
}
