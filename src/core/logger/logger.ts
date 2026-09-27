type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = __DEV__ && process.env.NODE_ENV !== 'test' ? 'debug' : 'warn';

export type Logger = Readonly<Record<LogLevel, (...args: unknown[]) => void>>;

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;
  const emit =
    (level: LogLevel) =>
    (...args: unknown[]) => {
      if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[MIN_LEVEL]) return;
      console[level](prefix, ...args);
    };

  return { debug: emit('debug'), info: emit('info'), warn: emit('warn'), error: emit('error') };
}
