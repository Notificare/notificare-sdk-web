import {
  getApplicationVersion,
  getBrowserLanguage,
  getBrowserRegion,
  getTimeZoneOffset,
  randomUUID,
} from './utils';
import { NotificareTransport } from '../models/notificare-transport';
import { DeviceRegistration } from './network/payloads/device-registration';
import { SDK_VERSION } from '../public-api';
import { request } from './network/request';
import { logger } from './logger';
import { getOptions } from './options';
import { NotificareDevice } from '../models/notificare-device';
import { EventSubscription } from '../event-subscription';

export function getCurrentDevice(): NotificareDevice | undefined {
  const deviceStr = localStorage.getItem('re.notifica.device');
  if (!deviceStr) return undefined;

  try {
    return JSON.parse(deviceStr);
  } catch (e) {
    logger.warning('Failed to decode the stored device.', e);

    // Remove the corrupted device from local storage.
    localStorage.removeItem('re.notifica.device');

    return undefined;
  }
}

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
}

export async function registerDeviceInternal(options: InternalRegisterDeviceOptions) {
  if (registrationChanged(options.token, options.userId, options.userName)) {
    const currentDevice = getCurrentDevice();

    let oldDeviceId: string | undefined;
    if (currentDevice?.id && currentDevice.id !== options.token) oldDeviceId = currentDevice.id;

    const deviceRegistration: DeviceRegistration = {
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

    await request('/api/device', {
      method: 'POST',
      body: deviceRegistration,
    });

    const device = convertRegistrationToStoredDevice(deviceRegistration, currentDevice);
    localStorage.setItem('re.notifica.device', JSON.stringify(device));
  } else {
    logger.info('Skipping device registration, nothing changed.');
  }

  const device = getCurrentDevice();
  if (device && onDeviceRegisteredCallback) {
    onDeviceRegisteredCallback(device);
  }
}

// region Events

type OnDeviceRegisteredCallback = (device: NotificareDevice) => void;
let onDeviceRegisteredCallback: OnDeviceRegisteredCallback | undefined;

export function onDeviceRegistered(callback: OnDeviceRegisteredCallback): EventSubscription {
  onDeviceRegisteredCallback = callback;

  return {
    remove: () => {
      onDeviceRegisteredCallback = undefined;
    },
  };
}

// endregion

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

function getDeviceLanguage(): string {
  const preferredLanguage = localStorage.getItem('re.notifica.preferred_language');
  if (!preferredLanguage) return getBrowserLanguage();

  return preferredLanguage;
}

function getDeviceRegion(): string {
  const preferredRegion = localStorage.getItem('re.notifica.preferred_region');
  if (!preferredRegion) return getBrowserRegion();

  return preferredRegion;
}

function convertRegistrationToStoredDevice(
  registration: DeviceRegistration,
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
    transport: registration.transport,
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