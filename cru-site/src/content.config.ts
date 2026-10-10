import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Zod must come from astro/zod. `z` re-exported from astro:content is
// deprecated, and this is Zod 4 (4.6.5), so `z.url()` not `z.string().url()`.
import { z } from 'astro/zod';

/** Matches the locale directory names in src/i18n/config.ts. */
const LOCALE_DIRS = '{en,zh-hant,zh-hans}';

/**
 * Entry ids become `<locale>/<slug>`, e.g. `zh-hant/cru-magazine`.
 * Pinning generateId (rather than letting it slugify) keeps `id.split('/')`
 * safe, which the locale-aware query layer in src/lib/collections.ts relies on.
 */
const idFromPath = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const seo = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(180).optional(),
    image: z.string().optional(),
  })
  .optional();

/**
 * Images are plain public-directory paths rather than Astro's image() helper.
 *
 * image() resolves and optimises at build time, which means a referenced file
 * that does not exist yet FAILS THE BUILD. Brand art and covers are supplied
 * separately (see the asset manifest in README.md), so public paths keep the
 * build green before the assets land, and let a non-developer drop a file in
 * without touching any code. The trade-off is no automatic optimisation.
 */
const assetPath = z.string().optional();

const brands = defineCollection({
  loader: glob({
    base: './src/content/brands',
    pattern: `${LOCALE_DIRS}/*.md`,
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['magazine', 'event']),

    /**
     * Trademark safety, expressed as data.
     *
     * Cru Magazine is Cru Media's own brand. Whisky Magazine and Whisky Live
     * are used under licence for Hong Kong & Macau. Because this is a schema
     * field rather than prose, the attribution line is rendered from it on
     * every surface a brand appears on and cannot drift or be forgotten.
     */
    ownership: z.enum(['own', 'licensed']),
    /** Required reading when ownership is 'licensed'; ignored otherwise. */
    licensedTerritory: z.string().optional(),

    tagline: z.string(),
    summary: z.string(),
    logo: assetPath,
    hero: assetPath,
    heroAlt: z.string().default(''),
    website: z.url().optional(),
    order: z.number().int().default(100),
    draft: z.boolean().default(false),
    seo,
  }),
});

const issues = defineCollection({
  loader: glob({
    base: './src/content/issues',
    pattern: `${LOCALE_DIRS}/*.md`,
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string(),
    /**
     * Plain slug, not reference('brands'): references resolve on `id`, and our
     * ids are locale-prefixed, so a zh-hant issue would have to point at
     * `zh-hant/cru-magazine` -- making the editor write the locale twice and
     * breaking whenever a translation is missing. Validated by check-content.
     */
    brandSlug: z.string(),
    /** Free-form so existing numbering ("Issue 58", "2026 #1") is preserved. */
    issueNumber: z.string(),
    publishedAt: z.coerce.date(),
    blurb: z.string(),
    cover: assetPath,
    coverAlt: z.string().default(''),
    readUrl: z.url().optional(),
    draft: z.boolean().default(false),
    seo,
  }),
});

const events = defineCollection({
  loader: glob({
    base: './src/content/events',
    pattern: `${LOCALE_DIRS}/*.md`,
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string(),
    brandSlug: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    venue: z.string(),
    city: z.string().default('Hong Kong'),
    audience: z.enum(['trade', 'consumer', 'trade-and-consumer']),
    summary: z.string(),
    hero: assetPath,
    heroAlt: z.string().default(''),
    ticketUrl: z.url().optional(),
    /**
     * upcoming/past is DERIVED from the dates at build time, so nobody has to
     * remember to flip a flag. This is only an escape hatch for odd cases.
     */
    statusOverride: z.enum(['upcoming', 'past']).optional(),
    draft: z.boolean().default(false),
    seo,
  }),
});

export const collections = { brands, issues, events };
