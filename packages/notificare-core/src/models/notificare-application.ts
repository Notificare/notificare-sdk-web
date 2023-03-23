import { NotificareNotificationAction } from './notificare-notification';

export interface NotificareApplication {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly branding: boolean;
  readonly services: Record<string, boolean>;
  readonly inboxConfig?: NotificareInboxConfig;
  readonly regionConfig?: NotificareRegionConfig;
  readonly websitePushConfig?: NotificareWebsitePushConfig;
  readonly userDataFields: NotificareUserDataField[];
  readonly actionCategories: NotificareActionCategory[];
}

export interface NotificareInboxConfig {
  readonly useInbox: boolean;
  readonly useUserInbox: boolean;
  readonly autoBadge: boolean;
}

export interface NotificareRegionConfig {
  readonly proximityUUID?: string;
}

export interface NotificareWebsitePushConfig {
  readonly icon: string;
  readonly allowedDomains: string[];
  readonly urlFormatString: string;
  readonly info?: NotificareWebsitePushConfigInfo;
  readonly vapid?: NotificareWebsitePushConfigVapid;
}

export interface NotificareWebsitePushConfigInfo {
  readonly subject: {
    readonly UID: string;
    readonly CN: string;
    readonly OU: string;
    readonly O: string;
    readonly C: string;
  };
}

export interface NotificareWebsitePushConfigVapid {
  readonly publicKey: string;
}

export interface NotificareUserDataField {
  readonly type: string;
  readonly key: string;
  readonly label: string;
}

export interface NotificareActionCategory {
  readonly type: string;
  readonly name: string;
  readonly description?: string;
  readonly actions: NotificareNotificationAction[];
}
