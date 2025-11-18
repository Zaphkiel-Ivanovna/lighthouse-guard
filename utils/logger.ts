export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private prefix: string;
  private minLevel: LogLevel;

  constructor(name: string, minLevel: LogLevel = LogLevel.DEBUG) {
    this.prefix = `\x1b[1m\x1b[47m\x1b[30m ${name} \x1b[0m`;
    this.minLevel = minLevel;
  }

  debug(...args: unknown[]): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      console.debug(this.prefix, ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.minLevel <= LogLevel.INFO) {
      console.info(this.prefix, ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.minLevel <= LogLevel.WARN) {
      console.warn(this.prefix, ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.minLevel <= LogLevel.ERROR) {
      console.error(this.prefix, ...args);
    }
  }

  log(...args: unknown[]): void {
    console.log(this.prefix, ...args);
  }
}
