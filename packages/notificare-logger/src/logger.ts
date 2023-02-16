export enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

export type LogLevelString = 'debug' | 'info' | 'warning' | 'error';

export class Logger {
  public readonly name: string;

  private logLevel: LogLevel = LogLevel.INFO;

  constructor(name: string) {
    this.name = name;

    // Keep track of the logger instances to update them from global
    // logging methods.
    instances.push(this);
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  public setLogLevel(logLevel: LogLevel | LogLevelString) {
    if (typeof logLevel === 'string') {
      this.logLevel = logLevelStringConverter[logLevel];
      return;
    }

    this.logLevel = logLevel;
  }

  public debug(...args: unknown[]) {
    this.log(LogLevel.DEBUG, ...args);
  }

  public info(...args: unknown[]) {
    this.log(LogLevel.INFO, ...args);
  }

  public warning(...args: unknown[]) {
    this.log(LogLevel.WARNING, ...args);
  }

  public error(...args: unknown[]) {
    this.log(LogLevel.ERROR, ...args);
  }

  private log(logLevel: LogLevel, ...args: unknown[]) {
    if (logLevel < this.logLevel) return;

    const now = new Date().toISOString();
    const method = consoleMethodConverter[logLevel];

    const format =
      this.logLevel >= LogLevel.INFO
        ? `[${now}] [${this.name}]`
        : `[${now}] [${this.name}] [${logLevelToStringConverter[logLevel]}]`;

    // eslint-disable-next-line no-console
    console[method](format, ...args);
  }
}

export function setLogLevel(logLevel: LogLevel | LogLevelString) {
  instances.forEach((instance) => instance.setLogLevel(logLevel));
}

/**
 * A container for all logger instances.
 */
const instances: Logger[] = [];

const logLevelStringConverter: Record<LogLevelString, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warning: LogLevel.WARNING,
  error: LogLevel.ERROR,
};

const logLevelToStringConverter: Record<LogLevel, LogLevelString> = {
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
};

type ConsoleMethod = Extract<keyof Console, 'log' | 'info' | 'warn' | 'error'>;

const consoleMethodConverter: Record<LogLevel, ConsoleMethod> = {
  [LogLevel.DEBUG]: 'log',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARNING]: 'warn',
  [LogLevel.ERROR]: 'error',
};
