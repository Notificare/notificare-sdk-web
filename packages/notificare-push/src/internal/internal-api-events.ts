import { logInternal } from '@notificare/web-core';

export async function logPushRegistration() {
  await logInternal({ type: 're.notifica.event.push.Registration' });
}

export async function logNotificationReceived(id: string) {
  await logInternal({
    type: 're.notifica.event.notification.Receive',
    notificationId: id,
  });
}

export async function logNotificationInfluenced(id: string) {
  await logInternal({
    type: 're.notifica.event.notification.Influenced',
    notificationId: id,
  });
}
