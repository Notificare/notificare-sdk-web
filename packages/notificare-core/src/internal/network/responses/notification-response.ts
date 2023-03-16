import {
  NotificareNotification,
  NotificareNotificationAction,
  NotificareNotificationActionIcon,
  NotificareNotificationAttachment,
} from '../../../models/notificare-notification';

export interface NetworkNotificationResponse {
  readonly notification: NetworkNotification;
}

export interface NetworkNotification {
  readonly _id: string;
  readonly partial?: boolean;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly content?: NetworkNotificationContent[];
  readonly actions?: NetworkNotificationAction[];
  readonly attachments?: NetworkNotificationAttachment[];
  readonly extra?: Record<string, unknown>;
}

export interface NetworkNotificationContent {
  readonly type: string;
  readonly data: unknown;
}

export interface NetworkNotificationAction {
  readonly type: string;
  readonly label?: string;
  readonly target?: string;
  readonly camera?: boolean;
  readonly keyboard?: boolean;
  readonly destructive?: boolean;
  readonly icon?: NetworkNotificationActionIcon;
}

export interface NetworkNotificationActionIcon {
  readonly android?: string;
  readonly ios?: string;
  readonly web?: string;
}

export interface NetworkNotificationAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export function convertNetworkNotificationToPublic(
  notification: NetworkNotification,
): NotificareNotification {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: notification._id,
    partial: notification.partial ?? false,
    type: notification.type,
    time: notification.time,
    title: notification.title,
    subtitle: notification.subtitle,
    message: notification.message,
    content: notification.content?.map(convertNetworkNotificationContentToPublic) ?? [],
    actions: (notification.actions ?? []).reduce((acc, currentValue) => {
      const action = convertNetworkNotificationActionToPublic(currentValue);
      if (action) acc.push(action);

      return acc;
    }, [] as NotificareNotificationAction[]),
    attachments: notification.attachments?.map(convertNetworkNotificationAttachmentToPublic) ?? [],
    extra: notification.extra ?? {},
  };
}

function convertNetworkNotificationContentToPublic(
  content: NetworkNotificationContent,
): NetworkNotificationContent {
  return {
    type: content.type,
    data: content.data,
  };
}

export function convertNetworkNotificationActionToPublic(
  action: NetworkNotificationAction,
): NotificareNotificationAction | undefined {
  if (!action.label) return undefined;

  let icon: NotificareNotificationActionIcon | undefined;
  if (action.icon?.android || action.icon?.ios || action.icon?.web) {
    icon = {
      android: action.icon.android,
      ios: action.icon.ios,
      web: action.icon.web,
    };
  }

  return {
    type: action.type,
    label: action.label,
    target: action.target,
    camera: action.camera ?? false,
    keyboard: action.keyboard ?? false,
    destructive: action.destructive,
    icon,
  };
}

function convertNetworkNotificationAttachmentToPublic(
  attachment: NetworkNotificationAttachment,
): NotificareNotificationAttachment {
  return {
    mimeType: attachment.mimeType,
    uri: attachment.uri,
  };
}
