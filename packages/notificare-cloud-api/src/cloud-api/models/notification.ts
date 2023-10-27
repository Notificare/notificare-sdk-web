export interface CloudNotification {
  readonly _id: string;
  readonly partial?: boolean;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly content?: CloudNotificationContent[];
  readonly actions?: CloudNotificationAction[];
  readonly attachments?: CloudNotificationAttachment[];
  readonly extra?: CloudNotificationExtra;
}

export interface CloudNotificationContent {
  readonly type: string;
  readonly data: unknown;
}

export interface CloudNotificationAction {
  readonly _id: string;
  readonly type: string;
  readonly label?: string;
  readonly target?: string;
  readonly camera?: boolean;
  readonly keyboard?: boolean;
}

export interface CloudNotificationAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export type CloudNotificationExtra = Record<string, unknown>;
