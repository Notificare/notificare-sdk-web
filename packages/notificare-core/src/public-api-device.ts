import {
  registerDeviceInternal,
  getCurrentDevice as getCurrentDeviceInternal,
} from './internal/internal-api-device';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';

export const getCurrentDevice = getCurrentDeviceInternal;

export async function registerDevice(options?: RegisterDeviceOptions): Promise<void> {
  // TODO: check prerequisites

  const device = getCurrentDevice();
  if (!device) throw new NotificareNotReadyError();

  await registerDeviceInternal({
    transport: device.transport,
    token: device.id,
    userId: options?.userId,
    userName: options?.userName,
  });
}

interface RegisterDeviceOptions {
  userId?: string;
  userName?: string;
}
