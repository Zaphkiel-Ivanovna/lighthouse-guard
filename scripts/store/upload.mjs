import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { api, APP_NAME, editableAppInfo, findApp, findVersion, LOCALES } from './asc.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCREENSHOT_TYPE = 'APP_IPHONE_67';
const PREVIEW_TYPE = 'IPHONE_67';
const POSTER_TIME_CODE = '00:00:16:06';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const previewsDir = resolve(
  args.find((arg) => arg.startsWith('--previews='))?.slice('--previews='.length) ??
    join(ROOT, '..', 'lighthouse-guard-video', 'out'),
);

async function ensureAppInfoLocalization(appId, locale) {
  const info = await editableAppInfo(appId);
  const { data: localizations } = await api('GET', `/appInfos/${info.id}/appInfoLocalizations`);
  if (localizations.some((item) => item.attributes.locale === locale)) return 'existing';
  if (dryRun) return 'missing';
  await api('POST', '/appInfoLocalizations', {
    data: {
      type: 'appInfoLocalizations',
      attributes: { locale, name: APP_NAME },
      relationships: { appInfo: { data: { type: 'appInfos', id: info.id } } },
    },
  });
  return 'created';
}

async function ensureVersionLocalization(versionId, locale) {
  const { data } = await api('GET', `/appStoreVersions/${versionId}/appStoreVersionLocalizations`);
  const existing = data.find((item) => item.attributes.locale === locale);
  if (existing || dryRun) return existing ?? null;
  const { data: created } = await api('POST', '/appStoreVersionLocalizations', {
    data: {
      type: 'appStoreVersionLocalizations',
      attributes: { locale },
      relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } } },
    },
  });
  return created;
}

async function ensureSet(localizationId, kind) {
  const [collection, typeKey, typeValue] =
    kind === 'screenshots'
      ? ['appScreenshotSets', 'screenshotDisplayType', SCREENSHOT_TYPE]
      : ['appPreviewSets', 'previewType', PREVIEW_TYPE];
  const { data } = await api('GET', `/appStoreVersionLocalizations/${localizationId}/${collection}`);
  const existing = data.find((set) => set.attributes[typeKey] === typeValue);
  if (existing) return existing;
  if (dryRun) return null;
  const { data: created } = await api('POST', `/${collection}`, {
    data: {
      type: collection,
      attributes: { [typeKey]: typeValue },
      relationships: {
        appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: localizationId } },
      },
    },
  });
  return created;
}

async function assets(set, kind) {
  if (!set) return [];
  const path =
    kind === 'screenshots' ? `/appScreenshotSets/${set.id}/appScreenshots` : `/appPreviewSets/${set.id}/appPreviews`;
  const { data } = await api('GET', path);
  return data;
}

async function upload(kind, setId, file, extra = {}) {
  const bytes = readFileSync(file);
  const [collection, parent] =
    kind === 'screenshots' ? ['appScreenshots', 'appScreenshotSet'] : ['appPreviews', 'appPreviewSet'];
  const { data: reservation } = await api('POST', `/${collection}`, {
    data: {
      type: collection,
      attributes: { fileName: basename(file), fileSize: bytes.length, ...extra },
      relationships: { [parent]: { data: { type: `${parent}s`, id: setId } } },
    },
  });
  for (const operation of reservation.attributes.uploadOperations) {
    const headers = Object.fromEntries(operation.requestHeaders.map((header) => [header.name, header.value]));
    const response = await fetch(operation.url, {
      method: operation.method,
      headers,
      body: bytes.subarray(operation.offset, operation.offset + operation.length),
    });
    if (!response.ok) throw new Error(`Upload of ${basename(file)} failed (${response.status})`);
  }
  await api('PATCH', `/${collection}/${reservation.id}`, {
    data: {
      type: collection,
      id: reservation.id,
      attributes: { uploaded: true, sourceFileChecksum: createHash('md5').update(bytes).digest('hex') },
    },
  });
  return reservation.id;
}

async function waitFor(kind, ids) {
  const collection = kind === 'screenshots' ? 'appScreenshots' : 'appPreviews';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const states = await Promise.all(
      ids.map(async (id) => (await api('GET', `/${collection}/${id}`)).data.attributes.assetDeliveryState?.state),
    );
    if (states.includes('FAILED')) throw new Error(`${kind}: processing failed (${states.join(', ')})`);
    if (states.every((state) => state === 'COMPLETE')) return 'COMPLETE';
    await new Promise((done) => setTimeout(done, 5000));
  }
  return 'PENDING';
}

async function replaceScreenshots(localizationId, locale) {
  const dir = join(ROOT, 'store', 'screenshots', locale, 'iphone-6.9');
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.png'))
    .sort()
    .map((name) => join(dir, name));
  const set = await ensureSet(localizationId, 'screenshots');
  const current = await assets(set, 'screenshots');
  console.log(`  screenshots: ${current.length} online, ${files.length} to upload`);
  if (dryRun) return;
  for (const item of current) await api('DELETE', `/appScreenshots/${item.id}`);
  const ids = [];
  for (const file of files) ids.push(await upload('screenshots', set.id, file));
  await api('PATCH', `/appScreenshotSets/${set.id}/relationships/appScreenshots`, {
    data: ids.map((id) => ({ type: 'appScreenshots', id })),
  });
  console.log(`  screenshots: ${await waitFor('screenshots', ids)}`);
}

async function replacePreview(localizationId, locale) {
  const file = join(previewsDir, `appstore-bold-${locale.slice(0, 2)}.mp4`);
  statSync(file);
  const set = await ensureSet(localizationId, 'previews');
  const current = await assets(set, 'previews');
  console.log(`  preview: ${current.length} online, uploading ${basename(file)}`);
  if (dryRun) return;
  for (const item of current) await api('DELETE', `/appPreviews/${item.id}`);
  const id = await upload('previews', set.id, file, { mimeType: 'video/mp4' });
  const state = await waitFor('previews', [id]);
  if (state === 'COMPLETE') {
    await api('PATCH', `/appPreviews/${id}`, {
      data: { type: 'appPreviews', id, attributes: { previewFrameTimeCode: POSTER_TIME_CODE } },
    });
  }
  console.log(`  preview: ${state}${state === 'COMPLETE' ? `, poster ${POSTER_TIME_CODE}` : ', poster not set yet'}`);
}

const app = await findApp();
const version = await findVersion(app.id);
console.log(
  `${app.attributes.name} (${app.attributes.primaryLocale}) · version ${version.attributes.versionString} · ${version.attributes.appStoreState ?? version.attributes.appVersionState}${dryRun ? ' · dry run' : ''}`,
);
for (const locale of LOCALES) {
  console.log(`${locale}:`);
  console.log(`  app info localization: ${await ensureAppInfoLocalization(app.id, locale)}`);
  const localization = await ensureVersionLocalization(version.id, locale);
  if (!localization) {
    console.log('  version localization: missing');
    continue;
  }
  await replaceScreenshots(localization.id, locale);
  await replacePreview(localization.id, locale);
}
