import {
  CloudDeviceRegistrationPayload,
  deleteCloudDevice,
  registerCloudDevice,
  registerCloudTestDevice,
} from '@notificare/web-cloud-api';
import { NotificareDeviceUnavailableError } from '../errors/notificare-device-unavailable-error';
import { NotificareNotReadyError } from '../errors/notificare-not-ready-error';
import { NotificareDevice } from '../models/notificare-device';
import { NotificareTransport } from '../models/notificare-transport';
import { getCloudApiEnvironment } from './cloud-api/environment';
import { notifyDeviceRegistered } from './consumer-events';
import { logApplicationInstall, logApplicationRegistration } from './internal-api-events';
import { launch as launchSession } from './internal-api-session';
import { isReady } from './launch-state';
import { logger } from './logger';
import { getOptions } from './options';
import { getCurrentDevice, storeCurrentDevice } from './storage/local-storage';
import {
  getApplicationVersion,
  getBrowserLanguage,
  getBrowserRegion,
  getTimeZoneOffset,
  randomUUID,
} from './utils';
import { SDK_VERSION } from './version';

export async function registerTemporaryDevice() {
  const device = getCurrentDevice();

  // NOTE: keep the same token if available and only when not changing transport providers.
  const token = device && device.transport === 'Notificare' ? device.id : randomUUID();

  await registerDeviceInternal({
    transport: 'Notificare',
    token,
    userId: device?.userId,
    userName: device?.userName,
  });
}

export async function registerPushDevice(options: InternalRegisterPushDeviceOptions) {
  const device = getCurrentDevice();

  await registerDeviceInternal({
    transport: options.transport,
    token: options.token,
    keys: options.keys,
    userId: device?.userId,
    userName: device?.userName,
  });

  // Launch the session and registration events when there was no device registered
  // due to the temporary devices flag.
  if (getOptions()?.ignoreTemporaryDevices && !device) {
    await launchSession();
    await logApplicationInstall();
    await logApplicationRegistration();
  }
}

export async function registerTestDevice(nonce: string) {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await registerCloudTestDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    nonce,
  });
}

export async function registerDeviceInternal(options: InternalRegisterDeviceOptions) {
  if (registrationChanged(options.token, options.userId, options.userName)) {
    const currentDevice = getCurrentDevice();

    let oldDeviceId: string | undefined;
    if (currentDevice?.id && currentDevice.id !== options.token) oldDeviceId = currentDevice.id;

    const registration: CloudDeviceRegistrationPayload = {
      deviceID: options.token,
      oldDeviceID: oldDeviceId,
      userID: options.userId,
      userName: options.userName,
      language: getDeviceLanguage(),
      region: getDeviceRegion(),
      platform: 'Web',
      transport: options.transport,
      keys: options.keys,
      sdkVersion: SDK_VERSION,
      appVersion: getApplicationVersion(),
      userAgent: navigator.userAgent,
      timeZoneOffset: getTimeZoneOffset(),

      // Submit a value when registering a temporary to prevent
      // otherwise let the push module take over and update the setting accordingly.
      allowedUI: options.transport === 'Notificare' ? false : undefined,
    };

    await registerCloudDevice({
      environment: getCloudApiEnvironment(),
      payload: registration,
    });

    const device = convertRegistrationToStoredDevice(registration, currentDevice);
    storeCurrentDevice(device);
  } else {
    logger.info('Skipping device registration, nothing changed.');
  }

  const device = getCurrentDevice();
  if (device) notifyDeviceRegistered(device);
}

export async function deleteDevice(): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await deleteCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  storeCurrentDevice(undefined);
}

export function checkPrerequisites() {
  if (!isReady()) {
    logger.warning('Notificare is not ready yet.');
    throw new NotificareNotReadyError();
  }
}

function registrationChanged(token?: string, userId?: string, userName?: string): boolean {
  const device = getCurrentDevice();

  if (!device) {
    logger.debug('Registration check: fresh installation');
    return true;
  }

  let changed = false;

  if (device.userId !== userId) {
    logger.debug('Registration check: user id changed');
    changed = true;
  }

  if (device.userName !== userName) {
    logger.debug('Registration check: user name changed');
    changed = true;
  }

  if (device.id !== token) {
    logger.debug('Registration check: device token changed');
    changed = true;
  }

  if (device.appVersion !== getOptions()?.applicationVersion) {
    logger.debug('Registration check: application version changed');
    changed = true;
  }

  if (device.sdkVersion !== SDK_VERSION) {
    logger.debug('Registration check: sdk version changed');
    changed = true;
  }

  if (device.timeZoneOffset !== getTimeZoneOffset()) {
    logger.debug('Registration check: timezone offset changed');
    changed = true;
  }

  if (device.language !== getDeviceLanguage()) {
    logger.debug('Registration check: language changed');
    changed = true;
  }

  if (device.region !== getDeviceRegion()) {
    logger.debug('Registration check: region changed');
    changed = true;
  }

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const lastRegistered = Date.parse(device.lastRegistered);
  if (lastRegistered < oneDayAgo.getTime()) {
    logger.debug('Registration check: region changed');
    changed = true;
  }

  return changed;
}

export function getDeviceLanguage(): string {
  const preferredLanguage = localStorage.getItem('re.notifica.preferred_language');
  if (!preferredLanguage) return getBrowserLanguage();

  return preferredLanguage;
}

export function getDeviceRegion(): string {
  const preferredRegion = localStorage.getItem('re.notifica.preferred_region');
  if (!preferredRegion) return getBrowserRegion();

  return preferredRegion;
}

function convertRegistrationToStoredDevice(
  registration: CloudDeviceRegistrationPayload,
  previousDevice: NotificareDevice | undefined,
): NotificareDevice {
  return {
    id: registration.deviceID,
    userId: registration.userID,
    userName: registration.userName,
    timeZoneOffset: registration.timeZoneOffset,
    sdkVersion: registration.sdkVersion,
    appVersion: registration.appVersion,
    language: registration.language,
    region: registration.region,
    transport: registration.transport as NotificareTransport,
    keys:
      registration.transport === 'Notificare'
        ? undefined
        : registration.keys ?? previousDevice?.keys,
    dnd: previousDevice?.dnd,
    userData: previousDevice?.userData ?? {},
    lastRegistered: new Date().toUTCString(),
  };
}

interface InternalRegisterDeviceOptions {
  transport: NotificareTransport;
  token: string;
  keys?: object;
  userId?: string;
  userName?: string;
}

interface InternalRegisterPushDeviceOptions {
  readonly transport: Extract<NotificareTransport, 'WebPush' | 'WebsitePush'>;
  readonly token: string;
  readonly keys?: object;
}
