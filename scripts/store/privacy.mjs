import { api, editableAppInfo, findApp, LOCALES } from './asc.mjs';

const POLICY_URLS = {
  'en-US': 'https://github.com/Zaphkiel-Ivanovna/lighthouse-guard/blob/main/docs/privacy/en.md',
  'fr-FR': 'https://github.com/Zaphkiel-Ivanovna/lighthouse-guard/blob/main/docs/privacy/fr.md',
};

const dryRun = process.argv.includes('--dry-run');
const app = await findApp();
const info = await editableAppInfo(app.id);
const { data: localizations } = await api('GET', `/appInfos/${info.id}/appInfoLocalizations`);

for (const locale of LOCALES) {
  const localization = localizations.find((item) => item.attributes.locale === locale);
  const url = POLICY_URLS[locale];
  if (!localization) {
    console.log(`${locale}: no app info localization, run upload.mjs first`);
    continue;
  }
  console.log(`${locale}: ${localization.attributes.privacyPolicyUrl ?? 'no privacy policy URL'} -> ${url}`);
  if (dryRun || localization.attributes.privacyPolicyUrl === url) continue;
  await api('PATCH', `/appInfoLocalizations/${localization.id}`, {
    data: { type: 'appInfoLocalizations', id: localization.id, attributes: { privacyPolicyUrl: url } },
  });
}
