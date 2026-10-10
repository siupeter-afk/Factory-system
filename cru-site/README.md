# Cru Media — brand site

Static, trilingual (English / 繁體中文 / 簡體中文) site for **Cru Media Limited**, Hong Kong,
covering the brand umbrella: *Cru Magazine*, *Whisky Magazine* (HK & Macau), *Whisky Live*
(HK & Macau) and the *Hong Kong Bar Show*.

Built with Astro 7 + Tailwind 4. Output is plain static files — deployable to Netlify,
Cloudflare Pages, GitHub Pages or any static host.

> **This project is completely independent of anything else in the parent repository.**
> It has its own `package.json`, its own dependencies and its own build. Nothing here
> imports from outside `cru-site/`, and nothing outside it was modified. See
> [Extracting to its own repo](#extracting-to-its-own-repo).

---

## Quick start

Requires **Node ≥ 22.12** (Astro 7's floor).

```bash
cd cru-site
npm install
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server. Draft content **is** visible here. |
| `npm run build` | Production build into `dist/`. Draft content is excluded. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run check` | TypeScript + Astro diagnostics. |
| `npm run check:i18n` | Fails if a locale is missing a UI string. |
| `npm run check:content` | Fails if content fields drift between locales. |
| `npm run verify` | All four checks, then the build. **Run this before deploying.** |

---

## Editing content

No code required. Content lives in `src/content/` as Markdown, one folder per language:

```
src/content/brands/en/cru-magazine.md
src/content/brands/zh-hant/cru-magazine.md
src/content/brands/zh-hans/cru-magazine.md
```

Three collections: `brands/`, `issues/` (magazine issues), `events/` (event editions).

**The filename is the URL.** `brands/en/cru-magazine.md` → `/brands/cru-magazine/`. Use the same
filename in all three language folders so the languages line up.

**English is the master list.** A page exists because the English file exists. If a Chinese
translation is missing, the site shows the English text with a short notice rather than a blank
page or a 404 — so a half-translated site still works.

**To add a language later**, copy the English file into `zh-hant/` or `zh-hans/` under the same
name and translate the text. Do not change the dates, numbers or `ownership` lines —
`npm run check:content` will fail if those stop matching.

### `ownership` — read this before editing a brand

Every brand file carries two fields that control the trademark line shown on the site:

```yaml
ownership: licensed              # 'own' or 'licensed'
licensedTerritory: "Hong Kong & Macau"
```

| Brand | `ownership` |
|---|---|
| Cru Magazine | `own` |
| Whisky Magazine | `licensed`, Hong Kong & Macau |
| Whisky Live Hong Kong | `licensed`, Hong Kong & Macau |
| Hong Kong Bar Show | `own` — **please confirm** |

The attribution line on every brand card, brand page and magazine listing is generated from this
field. That is deliberate: it means a licensed title cannot appear anywhere without its licence
note, and the note cannot fall out of step between languages. `npm run check:content` fails the
build if `ownership` differs between locales, or if a `licensed` brand has no territory.

### Event dates

Do **not** set an "upcoming" or "past" flag — it is worked out from the dates when the site
builds. Because of that, the deploy workflow includes a nightly rebuild; without one, a finished
event would sit under "Upcoming" until the next content change.

### Drafts

`draft: true` hides an entry from the built site but keeps it visible in `npm run dev`. The
`_example.md` files in `issues/` and `events/` are drafts: they show the required fields and are
not published. Replace them with real entries.

---

## Asset manifest — files to supply

The site is built and working without these. Layouts reserve correctly proportioned space, so
dropping a file in is all that is needed — no code changes. Everything goes in `public/`.

| Path | What | Notes |
|---|---|---|
| `favicon.svg` | Company mark | **A placeholder is in place — replace it.** |
| `apple-touch-icon.png` | 180×180 | Then re-add the `<link>` in `src/layouts/BaseLayout.astro`. |
| `brand/cru-media-logo.svg` | Company wordmark | Header currently renders type instead. |
| `brand/<slug>-logo.svg` | One per brand (4) | Then uncomment `logo:` in each brand file. |
| `brand/<slug>-hero.jpg` | One per brand | ≥ 2000px wide. Uncomment `hero:` + set `heroAlt:`. |
| `issues/<brand>-<issue>.jpg` | Magazine covers | **3:4 portrait.** Uncomment `cover:` + `coverAlt:`. |
| `events/<slug>/hero.jpg` | Event photography | Landscape. |
| `og/default.jpg` | Social share image | **1200×630.** Used for every page lacking its own. |
| `media-kit.pdf` | Rate card / media kit | Linked from *Advertise & Partner*. |

Brand slugs: `cru-magazine`, `whisky-magazine`, `whisky-live-hong-kong`, `hong-kong-bar-show`.

### Copy and details still outstanding

Every unverified value is marked `TODO` in the source rather than invented, so nothing fictional
can ship by accident. Find them all with:

```bash
grep -rn "TODO" src/ | grep -v node_modules
```

- `src/config/site.ts` — enquiry email, phone, registered address, company registration number,
  social URLs.
- `src/content/brands/*/*.md` — the body text for each of the four brands.
- Circulation / readership / attendance figures (*Advertise & Partner* and each brand page).
- Real magazine issues and event editions, replacing the `_example.md` drafts.
- Confirmation of **Hong Kong Bar Show** ownership (see above).

---

## Enquiry form

A static site has no backend, so the form's target is configurable in `src/config/site.ts`:

```ts
formMode: 'netlify'   // 'netlify' | 'endpoint' | 'mailto'
formEndpoint: ''      // required when formMode is 'endpoint'
```

- **`netlify`** — Netlify Forms picks the form up from the deployed HTML. Nothing else to set up.
- **`endpoint`** — plain `POST` to `formEndpoint` (Formspree, Web3Forms, Basin, …). Use this if
  you want to stay portable between hosts.
- **`mailto`** — no form at all; only the email link.

The form is a plain `<form method="POST">`, so it works with JavaScript disabled, and a `mailto:`
link is rendered in every mode — the page is never a dead end if the provider is misconfigured.

---

## Deploying

> ### ⚠️ Read this first: your email is in the blast radius
>
> The domain is registered with **Squarespace** (signed in with Google Workspace — i.e. almost
> certainly a former Google Domains registration that migrated across). That means the website
> DNS records and your **Google Workspace email MX records live in the same DNS panel**.
>
> Squarespace documents that **changing nameservers makes all of its DNS records stop applying** —
> you would have to re-create every custom record at the new provider, including the Google
> Workspace `MX` records and your `SPF` / `DKIM` / `DMARC` `TXT` records. Get that wrong and
> company email stops being delivered.
>
> The two recommended options below add records *inside* Squarespace and never touch
> nameservers, so email is never at risk.
>
> Also: if a live Squarespace **site** currently answers on this domain, repointing DNS takes it
> offline as the change propagates. Stage on the host's own preview URL, approve it, then switch.

### Option A — Netlify *(recommended)*

Squarespace has a built-in DNS preset for cloud platforms including Netlify.

1. Connect the repository in Netlify. `netlify.toml` already sets base `cru-site`,
   command `npm run build`, publish `dist`.
2. Netlify → Domain management → add `crumedia.net` and `www.crumedia.net`.
3. Squarespace → Domains → your domain → **DNS Settings** → apply the Netlify preset, or add
   Netlify's documented apex `A` record plus `www` `CNAME` → `<site-name>.netlify.app`.
4. **Leave every `MX` and `TXT` record untouched.**

Gets you deploy previews per push and a working enquiry form via Netlify Forms.

### Option B — GitHub Pages (own repository)

Requires extracting to its own repo first — GitHub Pages serves one site per repository, and the
parent repository already uses its slot.

1. Extract (below), push to the new repo.
2. `git mv deploy/github-pages.yml .github/workflows/deploy.yml`, then set
   *Settings → Pages → Source: GitHub Actions*.
3. Add `public/CNAME` containing `www.crumedia.net`.
4. In Squarespace **DNS Settings**, add as custom records (nameservers stay at Squarespace):

   | Type | Host | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `<your-github-username>.github.io` |

   Remove any default parking record on `@`. **Never add a wildcard `*` record** — GitHub treats
   it as a domain-takeover risk.
5. Enable **Enforce HTTPS** once the certificate issues.

Trade-offs: no form backend (use `formMode: 'endpoint'`), and GitHub Pages cannot set response
headers, so `public/_headers` is ignored.

### Option C — Cloudflare Pages

Fastest CDN and the most generous free tier, **but an apex domain wants Cloudflare's own
nameservers** (its CNAME flattening is what makes a root-domain CNAME work). That is exactly the
nameserver move warned about above: you would re-create the Google Workspace `MX` plus
`SPF`/`DKIM`/`DMARC` records in Cloudflare, and keep any `verify.squarespace.com` `CNAME` set to
*DNS-only*, not proxied. Choose it only if you want Cloudflare's WAF and analytics anyway.

### Not an option — Squarespace hosting

Squarespace is a closed CMS and **cannot host an Astro build**; there is no way to deploy
arbitrary static files into a Squarespace site. This setup treats Squarespace purely as the
*registrar*.

### Changing the domain

One line, `src/config/site.ts` → `SITE.domain`, plus `site:` in `astro.config.mjs`. That drives
canonical URLs, `hreflang`, the sitemap and `robots.txt`.

---

## Extracting to its own repo

```bash
# from the parent repository root
git subtree split -P cru-site -b cru-site-only
cd .. && git clone -b cru-site-only /path/to/parent-repo cru-media-site
```

Then in the new repo: set `netlify.toml`'s `base` to `"."`, and move
`deploy/github-pages.yml` to `.github/workflows/` if using GitHub Pages.

A plain copy works just as well if the history does not matter.

---

## How it fits together

| Path | Role |
|---|---|
| `astro.config.mjs` | i18n locales/routing, sitemap, Tailwind Vite plugin, `site` |
| `src/i18n/config.ts` | Locale list and the locale → `lang` / `hreflang` / `og:locale` tables |
| `src/i18n/ui.ts` | UI chrome strings, English as source of truth with fallback |
| `src/content.config.ts` | Zod schemas for `brands` / `issues` / `events` |
| `src/lib/collections.ts` | Locale-aware queries, English fallback, derived event status |
| `src/features/*.astro` | The real page bodies — **one copy, shared by all three locales** |
| `src/pages/**` | Thin route shims that pass a `locale` to a feature |
| `src/styles/global.css` | Tailwind 4 `@theme` design tokens — the whole palette, in one place |
| `scripts/check-*.{ts,mjs}` | The two consistency checks wired into `npm run verify` |

### Two details worth knowing

**English has no URL prefix.** `/about/`, `/zh-hant/about/`, `/zh-hans/about/`. There is no
`/en/`. Always build internal links with `getRelativeLocaleUrl(locale, path)` — hand-written
`/en/...` paths will 404.

**`<html lang>` and `hreflang` differ on purpose.** Traditional pages declare
`lang="zh-Hant-HK"`, which is what makes browsers pick Hong Kong Han glyph forms, while their
`hreflang` is the broader `zh-Hant` so search engines serve them across HK, Macau and Taiwan.
