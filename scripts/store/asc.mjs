import { Buffer } from 'node:buffer';
import { createPrivateKey, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API = 'https://api.appstoreconnect.apple.com/v1';
const BUNDLE_ID = 'dev.zaphkiel.lighthouseguard';
const EDITABLE_STATES = [
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
];

export const LOCALES = ['en-US', 'fr-FR'];
export const APP_NAME = 'Lighthouse Guard';

const keyId = process.env.ASC_KEY_ID;
const issuerId = process.env.ASC_ISSUER_ID;
if (!keyId || !issuerId) throw new Error('Set ASC_KEY_ID and ASC_ISSUER_ID');
const keyPath = process.env.ASC_KEY_PATH ?? join(homedir(), '.appstoreconnect', 'private_keys', `AuthKey_${keyId}.p8`);

const base64url = (value) => Buffer.from(value).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iss: issuerId, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' }));
  const key = createPrivateKey(readFileSync(keyPath));
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${signature.toString('base64url')}`;
}

export async function api(method, path, body) {
  const response = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = json?.errors?.map((error) => `${error.title}: ${error.detail}`).join('; ') ?? response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }
  return json;
}

export async function findApp() {
  const { data } = await api('GET', `/apps?filter[bundleId]=${BUNDLE_ID}`);
  if (!data.length) throw new Error(`No App Store Connect app for ${BUNDLE_ID}. Create the app record first.`);
  return data[0];
}

export async function findVersion(appId) {
  const { data } = await api('GET', `/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=20`);
  const editable = data.find((version) =>
    EDITABLE_STATES.includes(version.attributes.appStoreState ?? version.attributes.appVersionState),
  );
  if (!editable)
    throw new Error('No editable iOS version (Prepare for Submission). Create one in App Store Connect first.');
  return editable;
}

export async function editableAppInfo(appId) {
  const { data } = await api('GET', `/apps/${appId}/appInfos`);
  return data.find((item) => item.attributes.appStoreState !== 'READY_FOR_SALE') ?? data[0];
}
