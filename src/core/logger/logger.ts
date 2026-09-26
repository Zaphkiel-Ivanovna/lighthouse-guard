type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = __DEV__ ? 'debug' : 'warn';

export type Logger = Readonly<Record<LogLevel, (...args: unknown[]) => void>>;

/** Namespaced console logger. `debug`/`info` are dropped in production builds. */
export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;
  const emit =
    (level: LogLevel) =>
    (...args: unknown[]) => {
      if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[MIN_LEVEL]) return;
      // eslint-disable-next-line no-console -- the logger is the single console sink
      console[level](prefix, ...args);
    };

  return { debug: emit('debug'), info: emit('info'), warn: emit('warn'), error: emit('error') };
}
