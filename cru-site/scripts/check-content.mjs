/**
 * Cross-locale content consistency.
 *
 * Astro's Zod schemas validate each file in isolation. They cannot catch the
 * failure that actually matters here: a field drifting BETWEEN locales. If
 * `ownership: licensed` were changed to `own` in only the English file, every
 * schema would still pass while the Chinese pages quietly misstated a
 * trademark relationship. That is exactly what this script exists to prevent.
 *
 * Exits 1 on a real inconsistency; warns (exit 0) on a missing translation,
 * because the query layer falls back to English by design.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/content/', import.meta.url).pathname;
const LOCALES = ['en', 'zh-hant', 'zh-hans'];
const DEFAULT_LOCALE = 'en';
const COLLECTIONS = ['brands', 'issues', 'events'];

/** Fields that describe the thing itself, not its prose, so must not vary. */
const INVARIANT = [
  'kind', 'ownership', 'licensedTerritory', 'order', 'brandSlug',
  'issueNumber', 'publishedAt', 'startDate', 'endDate', 'audience',
  'draft', 'statusOverride',
];

let errors = 0;
let warnings = 0;

const fail = (msg) => { console.error(`  ERROR  ${msg}`); errors++; };
const warn = (msg) => { console.warn(`  warn   ${msg}`); warnings++; };

/** Minimal flat-frontmatter reader. Sufficient: our frontmatter has no nesting. */
function frontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

function slugsIn(collection, locale) {
  const dir = join(ROOT, collection, locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

const brandSlugs = new Set(slugsIn('brands', DEFAULT_LOCALE));

for (const collection of COLLECTIONS) {
  console.log(`\n[${collection}]`);
  const canonical = slugsIn(collection, DEFAULT_LOCALE);

  if (canonical.length === 0) {
    warn(`no ${DEFAULT_LOCALE} entries -- collection will render empty`);
    continue;
  }

  // 1. filename hygiene (a leading _ marks an example/template entry)
  for (const slug of canonical) {
    if (!/^_?[a-z0-9][a-z0-9-]*$/.test(slug)) {
      fail(`${collection}/${DEFAULT_LOCALE}/${slug}.md -- slug must be kebab-case`);
    }
  }

  for (const slug of canonical) {
    const base = frontmatter(join(ROOT, collection, DEFAULT_LOCALE, `${slug}.md`));
    if (!base) {
      fail(`${collection}/${DEFAULT_LOCALE}/${slug}.md -- no frontmatter block`);
      continue;
    }

    // 2. referential integrity: brandSlug must name a real brand
    if (base.brandSlug && !brandSlugs.has(base.brandSlug)) {
      fail(`${collection}/${slug} -- brandSlug "${base.brandSlug}" has no brands/${DEFAULT_LOCALE} entry`);
    }

    // 3. a licensed brand must say which territory it is licensed for
    if (base.ownership === 'licensed' && !base.licensedTerritory) {
      fail(`${collection}/${slug} -- ownership is 'licensed' but licensedTerritory is missing`);
    }

    // 4. invariant fields must agree across every locale that has the entry
    for (const locale of LOCALES) {
      if (locale === DEFAULT_LOCALE) continue;
      const file = join(ROOT, collection, locale, `${slug}.md`);
      if (!existsSync(file)) {
        warn(`${collection}/${locale}/${slug}.md missing -- will fall back to ${DEFAULT_LOCALE}`);
        continue;
      }
      const other = frontmatter(file);
      if (!other) {
        fail(`${collection}/${locale}/${slug}.md -- no frontmatter block`);
        continue;
      }
      for (const field of INVARIANT) {
        const a = base[field];
        const b = other[field];
        if (a !== b) {
          fail(
            `${collection}/${slug} -- "${field}" differs: ` +
              `${DEFAULT_LOCALE}=${JSON.stringify(a ?? null)} vs ${locale}=${JSON.stringify(b ?? null)}`,
          );
        }
      }
    }
  }
  if (errors === 0) console.log(`  ok     ${canonical.length} entr${canonical.length === 1 ? 'y' : 'ies'} x ${LOCALES.length} locales`);
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
