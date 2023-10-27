export type WorkerNotification = NotificareWorkerNotification | UnknownWorkerNotification;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownWorkerNotification = any;

export interface NotificareWorkerNotification {
  readonly 'x-sender': 'notificare';
  readonly system: boolean;
  readonly push: boolean;
  readonly requireInteraction: boolean;
  readonly renotify: boolean;
  readonly urlFormatString: string;
  readonly badge?: number;
  readonly id: string;
  readonly inboxItemId?: string;
  readonly inboxItemVisible?: boolean;
  readonly inboxItemExpires?: number;
  readonly notificationId: string;
  readonly notificationType: string;
  readonly application: string;
  readonly alertTitle?: string;
  readonly alertSubtitle?: string;
  readonly alert?: string;
  readonly icon?: string;
  readonly sound?: string;
  readonly attachment?: NotificareWorkerNotificationAttachment;
  readonly actions?: NotificareWorkerNotificationAction[];

  // to represent the extras.
  readonly [key: string]: unknown;
}

export interface NotificareWorkerNotificationAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export interface NotificareWorkerNotificationAction {
  readonly _id: string;
  readonly type: string;
  readonly label: string;
  readonly target?: string;
  readonly icon?: string;
  readonly keyboard?: boolean;
  readonly camera?: boolean;
}
