import {
  getCurrentDevice,
  isConfigured,
  NotificareDeviceUnavailableError,
  NotificareNotConfiguredError,
  request,
} from '@notificare/core';
import { hasWebPushSupport } from './internal-api-web-push';
import { hasSafariPushSupport } from './internal-api-safari-push';
import { logPushRegistration } from './internal-api-events';

export function hasWebPushCapabilities(): boolean {
  return hasWebPushSupport() || hasSafariPushSupport();
}

export async function updateNotificationSettings() {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const allowedUI = device.transport !== 'Notificare' && hasWebPushCapabilities();

  await request(`/api/device/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
    body: {
      allowedUI,
      webPushCapable: hasWebPushCapabilities(),
    },
  });

  const firstRegistrationStr = localStorage.getItem('re.notifica.push.first_registration');
  const firstRegistration = firstRegistrationStr == null || firstRegistrationStr === 'true';

  if (allowedUI && firstRegistration) {
    await logPushRegistration();
    localStorage.setItem('re.notifica.push.first_registration', 'false');
  }
}
