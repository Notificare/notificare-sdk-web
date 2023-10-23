import { CloudInAppMessage, CloudInAppMessageAction } from '@notificare/web-cloud-api';
import {
  NotificareInAppMessage,
  NotificareInAppMessageAction,
} from '../../models/notificare-in-app-message';

export function convertCloudInAppMessageToPublic(
  message: CloudInAppMessage,
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
    primaryAction: convertCloudInAppMessageActionToPublic(message.primaryAction),
    secondaryAction: convertCloudInAppMessageActionToPublic(message.secondaryAction),
  };
}

function convertCloudInAppMessageActionToPublic(
  action?: CloudInAppMessageAction,
): NotificareInAppMessageAction | undefined {
  if (!action) return undefined;

  return {
    label: action.label,
    destructive: action.destructive ?? false,
    url: action.url,
  };
}
