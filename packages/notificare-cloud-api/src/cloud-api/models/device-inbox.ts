export interface CloudDeviceInboxItem {
  readonly _id: string;
  readonly notification: string;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly attachment?: CloudDeviceInboxItemAttachment;
  readonly extra?: CloudDeviceInboxItemExtra;
  readonly opened?: boolean;
  readonly visible?: boolean;
  readonly expires?: string;
}

export interface CloudDeviceInboxItemAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export type CloudDeviceInboxItemExtra = Record<string, unknown>;
