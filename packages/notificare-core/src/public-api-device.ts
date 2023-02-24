import { getCurrentDevice, registerDeviceInternal } from './internal/internal-api-device';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';

export { getCurrentDevice, onDeviceRegistered } from './internal/internal-api-device';

export async function registerDevice(options: RegisterDeviceOptions): Promise<void> {
  // TODO: check prerequisites

  const device = getCurrentDevice();
  if (!device) throw new NotificareNotReadyError();

  await registerDeviceInternal({
    transport: device.transport,
    token: device.id,
    userId: options.userId ?? undefined,
    userName: options.userName ?? undefined,
  });
}

interface RegisterDeviceOptions {
  userId: string | null;
  userName: string | null;
}
