import { logInternal } from '@notificare/core';

export async function logPushRegistration() {
  await logInternal({ type: 're.notifica.event.push.Registration' });
}
