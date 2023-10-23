export interface CloudNotificationWebhookPayload extends Record<string, string | undefined> {
  readonly target: string;
  readonly label: string;
  readonly notificationID: string;
  readonly deviceID?: string;
  readonly userID?: string;
}
