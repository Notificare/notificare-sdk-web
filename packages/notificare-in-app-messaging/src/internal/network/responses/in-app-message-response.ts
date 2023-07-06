import {
  NotificareInAppMessage,
  NotificareInAppMessageAction,
} from '../../../models/notificare-in-app-message';

export interface NetworkInAppMessageResponse {
  readonly message: NetworkInAppMessage;
}

export interface NetworkInAppMessage {
  readonly _id: string;
  readonly name: string;
  readonly type: string;
  readonly context?: string[];
  readonly title?: string;
  readonly message?: string;
  readonly image?: string;
  readonly landscapeImage?: string;
  readonly delaySeconds?: number;
  readonly primaryAction?: NetworkInAppMessageAction;
  readonly secondaryAction?: NetworkInAppMessageAction;
}

export interface NetworkInAppMessageAction {
  readonly label?: string;
  readonly destructive?: boolean;
  readonly url?: string;
}

export function convertNetworkInAppMessageToPublic(
  message: NetworkInAppMessage,
): NotificareInAppMessage {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: message._id,
    name: message.name,
    type: message.type,
    context: message.context ?? [],
    title: message.title,
    message: message.message,
    image: message.image,
    landscapeImage: message.landscapeImage,
    delaySeconds: message.delaySeconds ?? 0,
    primaryAction: convertNetworkInAppMessageActionToPublic(message.primaryAction),
    secondaryAction: convertNetworkInAppMessageActionToPublic(message.secondaryAction),
  };
}

function convertNetworkInAppMessageActionToPublic(
  action?: NetworkInAppMessageAction,
): NotificareInAppMessageAction | undefined {
  if (!action) return undefined;

  return {
    label: action.label,
    destructive: action.destructive ?? false,
    url: action.url,
  };
}
