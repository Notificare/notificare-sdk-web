import { createCloudEvent } from '@notificare/web-cloud-api';
import { getCurrentDeviceId } from '../../configuration/parser';
import { getCloudApiEnvironment } from '../environment';

export async function logNotificationReceived(id: string) {
  await createCloudEvent({
    environment: await getCloudApiEnvironment(),
    payload: {
      type: 're.notifica.event.notification.Receive',
      notification: id,
      deviceID: getCurrentDeviceId(),
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
      deviceID: getCurrentDeviceId(),
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
      deviceID: getCurrentDeviceId(),
      timestamp: Date.now(),
    },
  });
}
