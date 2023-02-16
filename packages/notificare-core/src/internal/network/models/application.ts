import {
  NotificareActionCategory,
  NotificareApplication,
  NotificareInboxConfig,
  NotificareRegionConfig,
  NotificareUserDataField,
  NotificareWebPushConfig,
} from '../../../models/notificare-application';

export interface NetworkApplicationResponse {
  readonly application: NetworkApplication;
}

export interface NetworkApplication {
  readonly _id: string;
  readonly name: string;
  readonly category: string;
  readonly services?: Record<string, boolean>;
  readonly inboxConfig?: {
    readonly useInbox?: boolean;
    readonly autoBadge?: boolean;
  };
  readonly regionConfig?: {
    readonly proximityUUID?: string;
  };
  readonly webPushConfig?: {
    readonly icon?: string;
    readonly allowedDomains?: string[];
    readonly urlFormatString?: string;
    readonly info?: {
      readonly subject?: {
        readonly UID?: string;
        readonly CN?: string;
        readonly OU?: string;
        readonly O?: string;
        readonly C?: string;
      };
    };
    readonly vapid?: {
      readonly publicKey?: string;
    };
  };
  readonly userDataFields?: Array<{
    readonly type?: string;
    readonly key?: string;
    readonly label?: string;
  }>;
  readonly actionCategories?: Array<{
    readonly type?: string;
    readonly name?: string;
    readonly description?: string;
    // readonly actions?: NotificareNotificationAction[];
  }>;
}

export function convertNetworkApplicationToPublic(
  networkApplication: NetworkApplication,
): NotificareApplication {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: networkApplication._id,
    name: networkApplication.name,
    category: networkApplication.category,
    services: networkApplication.services ?? {},
    inboxConfig: convertNetworkApplicationToPublicInboxConfig(networkApplication),
    regionConfig: convertNetworkApplicationToPublicRegionConfig(networkApplication),
    webPushConfig: convertNetworkApplicationToPublicWebPushConfig(networkApplication),
    userDataFields: convertNetworkApplicationToPublicUserDataFields(networkApplication),
    actionCategories: convertNetworkApplicationToPublicNotificationCategories(networkApplication),
  };
}

function convertNetworkApplicationToPublicRegionConfig(
  networkApplication: NetworkApplication,
): NotificareRegionConfig | undefined {
  if (!networkApplication.regionConfig?.proximityUUID) return undefined;

  return {
    proximityUUID: networkApplication.regionConfig.proximityUUID,
  };
}

function convertNetworkApplicationToPublicInboxConfig(
  networkApplication: NetworkApplication,
): NotificareInboxConfig | undefined {
  if (!networkApplication.inboxConfig) return undefined;

  return {
    useInbox: networkApplication.inboxConfig.useInbox ?? false,
    autoBadge: networkApplication.inboxConfig.autoBadge ?? false,
  };
}

function convertNetworkApplicationToPublicWebPushConfig(
  networkApplication: NetworkApplication,
): NotificareWebPushConfig | undefined {
  if (
    !networkApplication.webPushConfig?.icon ||
    !networkApplication.webPushConfig?.allowedDomains ||
    !networkApplication.webPushConfig?.urlFormatString ||
    !networkApplication.webPushConfig?.info?.subject?.UID ||
    !networkApplication.webPushConfig?.info?.subject?.CN ||
    !networkApplication.webPushConfig?.info?.subject?.OU ||
    !networkApplication.webPushConfig?.info?.subject?.O ||
    !networkApplication.webPushConfig?.info?.subject?.C ||
    !networkApplication.webPushConfig?.vapid?.publicKey
  )
    return undefined;

  return {
    icon: networkApplication.webPushConfig.icon,
    allowedDomains: networkApplication.webPushConfig.allowedDomains,
    urlFormatString: networkApplication.webPushConfig.urlFormatString,
    info: {
      subject: {
        UID: networkApplication.webPushConfig.info.subject.UID,
        CN: networkApplication.webPushConfig.info.subject.CN,
        OU: networkApplication.webPushConfig.info.subject.OU,
        O: networkApplication.webPushConfig.info.subject.O,
        C: networkApplication.webPushConfig.info.subject.C,
      },
    },
    vapid: {
      publicKey: networkApplication.webPushConfig.vapid.publicKey,
    },
  };
}

function convertNetworkApplicationToPublicUserDataFields(
  networkApplication: NetworkApplication,
): NotificareUserDataField[] {
  if (!networkApplication.userDataFields) return [];

  const result: NotificareUserDataField[] = [];
  networkApplication.userDataFields.forEach((userDataField) => {
    if (!userDataField || !userDataField.type || !userDataField.key || !userDataField.label) return;

    result.push({
      type: userDataField.type,
      key: userDataField.key,
      label: userDataField.label,
    });
  });

  return result;
}

function convertNetworkApplicationToPublicNotificationCategories(
  networkApplication: NetworkApplication,
): NotificareActionCategory[] {
  if (!networkApplication.actionCategories) return [];

  const result: NotificareActionCategory[] = [];
  networkApplication.actionCategories.forEach((actionCategory) => {
    if (!actionCategory || !actionCategory.type || !actionCategory.name) return;

    result.push({
      type: actionCategory.type,
      name: actionCategory.name,
      description: actionCategory.description,
      actions: [], // TODO: update with parser
    });
  });

  return result;
}
