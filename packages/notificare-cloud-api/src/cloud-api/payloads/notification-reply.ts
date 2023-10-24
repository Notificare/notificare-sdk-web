export interface CloudNotificationReplyPayload {
  readonly notification: string;
  readonly label: string;
  readonly deviceID: string;
  readonly userID?: string;
  readonly data: CloudNotificationReplyPayloadData;
}

export interface CloudNotificationReplyPayloadData {
  readonly target?: string;
  readonly message?: string;
  readonly media?: string;
  readonly mimeType?: string;
}
