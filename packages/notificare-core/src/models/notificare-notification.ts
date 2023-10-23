export interface NotificareNotification {
  readonly id: string;
  readonly partial: boolean;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly content: NotificareNotificationContent[];
  readonly actions: NotificareNotificationAction[];
  readonly attachments: NotificareNotificationAttachment[];
  readonly extra: NotificareNotificationExtra;
}

export interface NotificareNotificationContent {
  readonly type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly data: any;
}

export interface NotificareNotificationAction {
  readonly type: string;
  readonly label: string;
  readonly target?: string;
  readonly keyboard: boolean;
  readonly camera: boolean;
}

export interface NotificareNotificationAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotificareNotificationExtra = Record<string, any>;
