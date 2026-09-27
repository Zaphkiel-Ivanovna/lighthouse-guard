const COMPONENT = /([A-Z]):\s*([\w.-]+)/g;

export function formatFirmware(raw: string): string {
  const components = [...raw.matchAll(COMPONENT)].map(([, label, version]) => `${label} ${version}`);
  return components.length > 1 ? components.join(' · ') : raw;
}
