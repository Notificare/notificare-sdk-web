import { createCloudEvent } from '@notificare/web-cloud-api';
import { logger } from './logger';
import { getSession } from './internal-api-session-shared';
import { getCurrentDevice } from './storage/local-storage';
import { isConfigured } from './launch-state';
import { getCloudApiEnvironment } from './cloud-api/environment';

export async function logApplicationInstall() {
  await logInternal({ type: 're.notifica.event.application.Install' });
}

export async function logApplicationRegistration() {
  await logInternal({ type: 're.notifica.event.application.Registration' });
}

export async function logApplicationUpgrade() {
  await logInternal({ type: 're.notifica.event.application.Upgrade' });
}

export async function logApplicationOpen(sessionId: string) {
  await logInternal({
    type: 're.notifica.event.application.Open',
    sessionId,
  });
}

export async function logApplicationClose(sessionId: string, sessionLength: number) {
  await logInternal({
    type: 're.notifica.event.application.Close',
    sessionId,
    data: {
      length: sessionLength.toString(),
    },
  });
}

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

  await createCloudEvent({
    environment: getCloudApiEnvironment(),
    payload: {
      type: options.type,
      timestamp: Date.now(),
      deviceID: currentDevice?.id,
      userID: currentDevice?.userId,
      sessionID: options.sessionId ?? getSession()?.id,
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
