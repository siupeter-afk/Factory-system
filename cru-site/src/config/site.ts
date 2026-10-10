/**
 * Single source of truth for company details and integration endpoints.
 *
 * Every value marked TODO must be supplied before launch. They are deliberately
 * left as obvious placeholders rather than invented, so nothing unverified can
 * ship unnoticed -- `npm run check:todo` lists what is still outstanding.
 */
export const SITE = {
  domain: 'www.crumedia.net',
  legalName: 'Cru Media Limited',
  shortName: 'Cru Media',

  /** TODO: supply the public enquiry address. */
  email: 'TODO-enquiries@crumedia.net',
  /** TODO: supply the office telephone, in international format. */
  phone: 'TODO',
  /** TODO: supply the registered office address. */
  address: 'TODO — registered office address, Hong Kong',
  /** TODO: supply the Hong Kong company registration number. */
  registrationNumber: 'TODO',

  /** TODO: supply profile URLs; blank entries are simply not rendered. */
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },

  /** Supplied asset — see the asset manifest in README.md. */
  mediaKitPath: '/media-kit.pdf',

  /**
   * Enquiry form handling. A static host has no backend, so one of these is
   * required:
   *   'netlify'  -- Netlify Forms; no endpoint needed, works on deploy.
   *   'endpoint' -- POST to `formEndpoint` (e.g. a Formspree URL).
   *   'mailto'   -- no POST at all; the mailto: fallback is the only path.
   * The mailto: fallback is always rendered regardless of this setting.
   */
  formMode: 'netlify' as 'netlify' | 'endpoint' | 'mailto',
  /** TODO: set when formMode is 'endpoint'. */
  formEndpoint: '',
} as const;

/** Territory used for the licensed-brand attribution line. */
export const LICENSED_TERRITORY_DEFAULT = 'Hong Kong & Macau';
