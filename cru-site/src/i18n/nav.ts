import type { UIKey } from './ui.ts';

/**
 * The site's primary routes. `path` is locale-independent -- the locale prefix
 * is added by getRelativeLocaleUrl() at render time, never by concatenation.
 */
export interface NavItem {
  /** Path relative to the locale root. '' is the home page. */
  path: string;
  labelKey: UIKey;
}

export const NAV: readonly NavItem[] = [
  { path: 'brands', labelKey: 'nav.brands' },
  { path: 'magazines', labelKey: 'nav.magazines' },
  { path: 'events', labelKey: 'nav.events' },
  { path: 'advertise', labelKey: 'nav.advertise' },
  { path: 'about', labelKey: 'nav.about' },
  { path: 'contact', labelKey: 'nav.contact' },
] as const;

/** Every routable path, including the home page -- used by verification. */
export const ALL_PATHS: readonly string[] = ['', ...NAV.map((n) => n.path)];
