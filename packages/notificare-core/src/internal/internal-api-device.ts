import {
  CloudCreateDevicePayload,
  CloudCreateDeviceResponse,
  CloudDeviceUpdateBaseAttributesPayload,
  CloudUpgradeToLongLivedDevicePayload,
  createCloudDevice,
  deleteCloudDevice,
  registerCloudTestDevice,
  updateCloudDevice,
  upgradeToLongLivedCloudDevice,
} from '@notificare/web-cloud-api';
import { NotificareDeviceUnavailableError } from '../errors/notificare-device-unavailable-error';
import { NotificareNotReadyError } from '../errors/notificare-not-ready-error';
import { getCloudApiEnvironment } from './cloud-api/environment';
import { isReady } from './launch-state';
import { logger } from './logger';
import { getStoredDevice, isLongLivedDevice, setStoredDevice } from './storage/local-storage';
import {
  getApplicationVersion,
  getBrowserLanguage,
  getBrowserRegion,
  getTimeZoneOffset,
} from './utils';
import { SDK_VERSION } from './version';

export async function createDevice() {
  const payload: CloudCreateDevicePayload = {
    language: getDeviceLanguage(),
    region: getDeviceRegion(),
    platform: 'Web',
    sdkVersion: SDK_VERSION,
    appVersion: getApplicationVersion(),
    userAgent: navigator.userAgent,
    timeZoneOffset: getTimeZoneOffset(),
  };

  const response = await createCloudDevice({
    environment: getCloudApiEnvironment(),
    payload,
  });

  setStoredDevice({
    id: response.device.deviceID,
    userId: undefined,
    userName: undefined,
    timeZoneOffset: payload.timeZoneOffset,
    sdkVersion: payload.sdkVersion,
    appVersion: payload.appVersion,
    userAgent: payload.userAgent,
    language: payload.language,
    region: payload.region,
    dnd: undefined,
    userData: {},
  });
}

export async function updateDevice() {
  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const payload: CloudDeviceUpdateBaseAttributesPayload = {
    language: getDeviceLanguage(),
    region: getDeviceRegion(),
    platform: 'Web',
    sdkVersion: SDK_VERSION,
    appVersion: getApplicationVersion(),
    userAgent: navigator.userAgent,
    timeZoneOffset: getTimeZoneOffset(),
  };

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload,
  });

  setStoredDevice({
    ...device,
    language: payload.language,
    region: payload.region,
    sdkVersion: payload.sdkVersion,
    appVersion: payload.appVersion,
    userAgent: payload.userAgent,
    timeZoneOffset: payload.timeZoneOffset,
  });
}

export async function upgradeToLongLivedDeviceWhenNeeded() {
  const currentDevice = getStoredDevice();
  if (!currentDevice) return;

  if (isLongLivedDevice(currentDevice) || !currentDevice.transport) return;

  logger.info('Upgrading current device from legacy format.');

  const payload: CloudUpgradeToLongLivedDevicePayload = {
    deviceID: currentDevice.id,
    transport: currentDevice.transport,
    subscriptionId: currentDevice.transport !== 'Notificare' ? currentDevice.id : undefined,
    keys: currentDevice.keys ?? undefined,
    language: currentDevice.language,
    region: currentDevice.region,
    platform: 'Web',
    sdkVersion: currentDevice.sdkVersion,
    appVersion: currentDevice.appVersion,
    userAgent: currentDevice.userAgent,
    timeZoneOffset: currentDevice.timeZoneOffset,
  };

  const response = await upgradeToLongLivedCloudDevice({
    environment: getCloudApiEnvironment(),
    payload,
  });

  const createDeviceResponse: CloudCreateDeviceResponse | undefined =
    response.status === 201 ? await response.json() : undefined;

  if (createDeviceResponse) {
    logger.debug('New device identifier created.');
  }

  setStoredDevice({
    id: createDeviceResponse?.device?.deviceID ?? currentDevice.id,
    userId: currentDevice.userId,
    userName: currentDevice.userName,
    timeZoneOffset: currentDevice.timeZoneOffset,
    sdkVersion: currentDevice.sdkVersion,
    appVersion: currentDevice.appVersion,
    userAgent: currentDevice.userAgent,
    language: currentDevice.language,
    region: currentDevice.region,
    dnd: currentDevice.dnd,
    userData: currentDevice.userData,
  });
}

export async function registerTestDevice(nonce: string) {
  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await registerCloudTestDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    nonce,
  });
}

export async function deleteDevice(): Promise<void> {
  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await deleteCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  setStoredDevice(undefined);
}

export function checkPrerequisites() {
  if (!isReady()) {
    logger.warning('Notificare is not ready yet.');
    throw new NotificareNotReadyError();
  }
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
