export enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

export type LogLevelString = 'debug' | 'info' | 'warning' | 'error';

export interface LoggingOptions {
  readonly group?: string;
  readonly includeName?: boolean;
  readonly includeLogLevel?: boolean;
  readonly includeTimestamp?: boolean;
}

export class Logger {
  public readonly name: string;

  public readonly options: LoggingOptions;

  private logLevel: LogLevel = LogLevel.INFO;

  constructor(name: string, options?: LoggingOptions) {
    this.name = name;
    this.options = {
      ...defaultLoggingOptions,
      ...options,
    };

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

    const method = consoleMethodConverter[logLevel];
    const groupBadge = this.getGroupBadge(logLevel);
    const messagePrefix = this.getMessagePrefix(logLevel);

    // eslint-disable-next-line no-console
    console[method](...groupBadge, messagePrefix, ...args);
  }

  private getGroupBadge(logLevel: LogLevel): string[] {
    const styles = [
      `background: ${consoleMethodColor[logLevel]}`,
      'border-radius: 0.5em',
      'color: white',
      'font-weight: bold',
      'padding: 2px 0.5em',
    ];

    const { group } = this.options;
    if (!group) return [];

    return [`%c${group}`, styles.join(';')];
  }

  private getMessagePrefix(logLevel: LogLevel): string {
    const parts = [];

    if (this.options.includeTimestamp) {
      const now = new Date().toISOString();
      parts.push(`[${now}]`);
    }

    if (this.options.includeName) {
      parts.push(`[${this.name}]`);
    }

    if (
      this.options.includeLogLevel ||
      (this.options.includeLogLevel === undefined && logLevel < LogLevel.INFO)
    ) {
      parts.push(`[${logLevelToStringConverter[logLevel]}]`);
    }

    return parts.join(' ');
  }
}

export function setLogLevel(logLevel: LogLevel | LogLevelString) {
  instances.forEach((instance) => instance.setLogLevel(logLevel));
}

const defaultLoggingOptions: LoggingOptions = {
  includeName: true,
  includeTimestamp: true,
};

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

const consoleMethodColor: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '#7F8C8D',
  [LogLevel.INFO]: '#3498DB',
  [LogLevel.WARNING]: '#F39C12',
  [LogLevel.ERROR]: '#C0392B',
};
