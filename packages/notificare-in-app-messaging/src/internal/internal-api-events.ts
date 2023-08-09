import { logInternal } from '@notificare/web-core';
import { NotificareInAppMessage } from '../models/notificare-in-app-message';
import { ActionType } from './types/action-type';

export async function logInAppMessageViewed(message: NotificareInAppMessage) {
  await logInternal({
    type: 're.notifica.event.inappmessage.View',
    data: { message: message.id },
  });
}

export async function logInAppMessageActionClicked(
  message: NotificareInAppMessage,
  actionType: ActionType,
) {
  await logInternal({
    type: 're.notifica.event.inappmessage.Action',
    data: {
      message: message.id,
      action: actionType,
    },
  });
}
