import {
  NotificareActionCategory,
  NotificareApplication,
  NotificareInboxConfig,
  NotificareRegionConfig,
  NotificareUserDataField,
  NotificareWebPushConfig,
  NotificareWebPushConfigInfo,
  NotificareWebPushConfigVapid,
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
  readonly websitePushConfig?: {
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
    !networkApplication.websitePushConfig?.icon ||
    !networkApplication.websitePushConfig?.allowedDomains ||
    !networkApplication.websitePushConfig?.urlFormatString
  ) {
    return undefined;
  }

  let info: NotificareWebPushConfigInfo | undefined;
  if (
    networkApplication.websitePushConfig?.info?.subject?.UID &&
    networkApplication.websitePushConfig?.info?.subject?.CN &&
    networkApplication.websitePushConfig?.info?.subject?.OU &&
    networkApplication.websitePushConfig?.info?.subject?.O &&
    networkApplication.websitePushConfig?.info?.subject?.C
  ) {
    info = {
      subject: {
        UID: networkApplication.websitePushConfig.info.subject.UID,
        CN: networkApplication.websitePushConfig.info.subject.CN,
        OU: networkApplication.websitePushConfig.info.subject.OU,
        O: networkApplication.websitePushConfig.info.subject.O,
        C: networkApplication.websitePushConfig.info.subject.C,
      },
    };
  }

  let vapid: NotificareWebPushConfigVapid | undefined;
  if (networkApplication.websitePushConfig?.vapid?.publicKey) {
    vapid = {
      publicKey: networkApplication.websitePushConfig.vapid.publicKey,
    };
  }

  return {
    icon: networkApplication.websitePushConfig.icon,
    allowedDomains: networkApplication.websitePushConfig.allowedDomains,
    urlFormatString: networkApplication.websitePushConfig.urlFormatString,
    info,
    vapid,
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
