import { createCloudEvent } from '@notificare/web-cloud-api';
import { getCurrentPushToken } from '../../utils';
import { getCloudApiEnvironment } from '../environment';

export async function logNotificationReceived(id: string) {
  await createCloudEvent({
    environment: await getCloudApiEnvironment(),
    payload: {
      type: 're.notifica.event.notification.Receive',
      notification: id,
      deviceID: await getCurrentPushToken(),
      timestamp: Date.now(),
    },
  });
}

export async function logNotificationOpen(id: string) {
  await createCloudEvent({
    environment: await getCloudApiEnvironment(),
    payload: {
      type: 're.notifica.event.notification.Open',
      notification: id,
      deviceID: await getCurrentPushToken(),
      timestamp: Date.now(),
    },
  });
}

export async function logNotificationInfluenced(id: string) {
  await createCloudEvent({
    environment: await getCloudApiEnvironment(),
    payload: {
      type: 're.notifica.event.notification.Influenced',
      notification: id,
      deviceID: await getCurrentPushToken(),
      timestamp: Date.now(),
    },
  });
}
