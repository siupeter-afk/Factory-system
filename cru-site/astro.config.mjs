import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Locale directory names. These must match the folder names under src/pages/
// and src/content/* exactly. `en` is the default locale and therefore has no
// URL prefix (see routing.prefixDefaultLocale below).
const LOCALES = ['en', 'zh-hant', 'zh-hans'];

export default defineConfig({
  site: 'https://www.crumedia.net',

  // No `base`: a custom domain serves from the root, so the build is portable
  // across Netlify, Cloudflare Pages and GitHub Pages without rewriting paths.

  // 'ignore' emits both /events and /events/ as valid, which is the most
  // forgiving option across hosts that differ on trailing-slash redirects.
  trailingSlash: 'ignore',

  i18n: {
    locales: LOCALES,
    defaultLocale: 'en',
    routing: {
      // en -> /about ; zh-hant -> /zh-hant/about ; zh-hans -> /zh-hans/about
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      // Maps our directory names to the BCP-47 tags that belong in hreflang.
      filter: (page) => !page.includes('/404'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          'zh-hant': 'zh-Hant',
          'zh-hans': 'zh-Hans',
        },
      },
    }),
  ],

  vite: {
    // Tailwind 4 is wired through its Vite plugin. @astrojs/tailwind is NOT
    // used: it is peer-capped at astro ^5 / tailwindcss ^3 and is incompatible
    // with this stack. Tailwind 4 is CSS-first, so there is no tailwind.config.js
    // either -- design tokens live in the @theme block in src/styles/global.css.
    plugins: [tailwindcss()],
  },
});
