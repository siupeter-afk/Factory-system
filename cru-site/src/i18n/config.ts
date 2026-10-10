/** Locale directory names, matching astro.config.mjs i18n.locales exactly. */
export const LOCALES = ['en', 'zh-hant', 'zh-hans'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * BCP-47 tags for the <html lang> attribute and hreflang annotations.
 * The directory name ('zh-hant') is not a valid language tag on its own, so
 * never emit it into markup -- always go through this map.
 */
export const BCP47: Record<Locale, string> = {
  en: 'en',
  'zh-hant': 'zh-Hant-HK',
  'zh-hans': 'zh-Hans',
};

/**
 * hreflang values, which are deliberately BROADER than the html lang above.
 *
 * `<html lang="zh-Hant-HK">` drives Han glyph-variant selection, so Hong Kong
 * readers get HK letterforms. But hreflang="zh-Hant" (no region) tells search
 * engines to serve that page across every Traditional market -- HK, Macau and
 * Taiwan -- rather than narrowing it to HK alone.
 */
export const HREFLANG: Record<Locale, string> = {
  en: 'en',
  'zh-hant': 'zh-Hant',
  'zh-hans': 'zh-Hans',
};

/** Open Graph locale codes. */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_HK',
  'zh-hant': 'zh_HK',
  'zh-hans': 'zh_CN',
};

/** Language names, each written in its own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-hant': '繁體中文',
  'zh-hans': '简体中文',
};

/** Short labels for the compact locale switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  'zh-hant': '繁',
  'zh-hans': '简',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
