import { backupFileName, createBackup, parseBackup, type Backup } from './backup';

export async function exportBackupFile(dialogTitle: string): Promise<void> {
  const [{ File, Paths }, Sharing] = await Promise.all([import('expo-file-system'), import('expo-sharing')]);
  const backup = createBackup();
  const file = new File(Paths.cache, backupFileName(backup));
  if (file.exists) file.delete();
  file.create();
  await file.write(JSON.stringify(backup, null, 2));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle });
}

export type ImportResult =
  | { readonly status: 'canceled' }
  | { readonly status: 'invalid' }
  | { readonly status: 'ready'; readonly backup: Backup };

export async function pickBackupFile(): Promise<ImportResult> {
  const [{ File }, DocumentPicker] = await Promise.all([import('expo-file-system'), import('expo-document-picker')]);
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'public.json', 'text/plain'],
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { status: 'canceled' };
  const backup = parseBackup(await new File(asset.uri).text());
  return backup ? { status: 'ready', backup } : { status: 'invalid' };
}
