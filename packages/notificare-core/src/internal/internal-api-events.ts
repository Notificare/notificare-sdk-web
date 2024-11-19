import { createCloudEvent } from '@notificare/web-cloud-api';
import { getCloudApiEnvironment } from './cloud-api/environment';
import { getSession } from './internal-api-session-shared';
import { isConfigured } from './launch-state';
import { logger } from './logger';
import { getStoredDevice } from './storage/local-storage';

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

export async function logApplicationClose(
  sessionId: string,
  sessionLength: number,
  sessionCloseTimestamp: number,
) {
  await logInternal({
    type: 're.notifica.event.application.Close',
    timestamp: sessionCloseTimestamp,
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

/**
 * Logs in Notificare a custom event.
 *
 * This function allows logging, in Notificare, of custom events, optionally associating structured
 * data for more detailed event tracking and analysis.
 *
 * @param event The name of the custom event to log.
 * @param data Optional Record object containing event data for further details.
 */
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

  const currentDevice = getStoredDevice();

  await createCloudEvent({
    environment: getCloudApiEnvironment(),
    payload: {
      type: options.type,
      timestamp: options.timestamp ?? Date.now(),
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
  readonly timestamp?: number;
  readonly data?: Record<string, unknown>;
  readonly sessionId?: string;
  readonly notificationId?: string;
}
