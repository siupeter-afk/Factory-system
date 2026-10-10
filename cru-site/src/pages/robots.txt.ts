import type { APIRoute } from 'astro';

/**
 * Emitted rather than kept as a static file so the Sitemap line follows the
 * `site` config instead of hardcoding a domain.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
