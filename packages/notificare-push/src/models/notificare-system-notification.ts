export interface NotificareSystemNotification {
  readonly id: string;
  readonly type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly extra: Record<string, any>;
}
