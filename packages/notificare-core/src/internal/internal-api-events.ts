import { getCurrentDevice } from './internal-api-device';
import { request } from './network/request';
import { isConfigured } from '../public-api';
import { logger } from './logger';

export async function logNotificationOpen(notificationId: string) {
  await logInternal({
    type: 're.notifica.event.notification.Open',
    notificationId,
  });
}

export async function logCustom(event: string, data?: Record<string, unknown>) {
  await logInternal({
    type: `re.notifica.event.custom.${event}`,
    data,
  });
}

export async function logInternal(options: InternalLogEventOptions) {
  if (!isConfigured()) {
    logger.debug('Notificare is not configured. Skipping event log...');
    return;
  }

  const currentDevice = getCurrentDevice();

  await request('/api/event', {
    method: 'POST',
    body: {
      type: options.type,
      timestamp: Date.now(),
      deviceID: currentDevice?.id,
      userID: currentDevice?.userId,
      sessionID: options.sessionId, // TODO: fallback to the session module
      notification: options.notificationId,
      data: options.data,
    },
  });
}

interface InternalLogEventOptions {
  readonly type: string;
  readonly data?: Record<string, unknown>;
  readonly sessionId?: string;
  readonly notificationId?: string;
}
