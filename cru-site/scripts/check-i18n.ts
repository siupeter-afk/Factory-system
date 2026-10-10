/** Fails if any locale is missing a UI string key that English defines. */
import { LOCALES } from '../src/i18n/config.ts';
import { missingKeys } from '../src/i18n/ui.ts';

let bad = false;
for (const locale of LOCALES) {
  const missing = missingKeys(locale);
  if (missing.length) {
    bad = true;
    console.error(`[i18n] ${locale} is missing ${missing.length} key(s):`);
    for (const k of missing) console.error(`         ${k}`);
  } else {
    console.log(`[i18n] ${locale}: complete`);
  }
}
process.exit(bad ? 1 : 0);
