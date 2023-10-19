export interface CloudInboxItem {
  readonly _id: string;
  readonly notification: string;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly attachment?: CloudInboxItemAttachment;
  readonly extra?: CloudInboxItemExtra;
  readonly opened?: boolean;
  readonly visible?: boolean;
  readonly expires?: string;
}

export interface CloudInboxItemAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export type CloudInboxItemExtra = Record<string, unknown>;
