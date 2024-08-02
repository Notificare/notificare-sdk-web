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
import { getOptions } from './options';
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

  if (!registrationChanged()) {
    logger.debug('Skipping device update, nothing changed.');
    return;
  }

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

// export async function registerPushDevice(options: InternalRegisterPushDeviceOptions) {
//   const device = getStoredDevice();
//
//   // await registerDeviceInternal({
//   //   transport: options.transport,
//   //   token: options.token,
//   //   keys: options.keys,
//   //   userId: device?.userId,
//   //   userName: device?.userName,
//   // });
//
//   // Launch the session and registration events when there was no device registered
//   // due to the temporary devices flag.
//   if (getOptions()?.ignoreTemporaryDevices && !device) {
//     await launchSession();
//     await logApplicationInstall();
//     await logApplicationRegistration();
//   }
// }

export async function registerTestDevice(nonce: string) {
  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await registerCloudTestDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    nonce,
  });
}

// export async function registerDeviceInternal(options: InternalRegisterDeviceOptions) {
//   if (registrationChanged(options.token, options.userId, options.userName)) {
//     const currentDevice = getStoredDevice();
//
//     let oldDeviceId: string | undefined;
//     if (currentDevice?.id && currentDevice.id !== options.token) oldDeviceId = currentDevice.id;
//
//     const registration: CloudDeviceRegistrationPayload = {
//       deviceID: options.token,
//       oldDeviceID: oldDeviceId,
//       userID: options.userId,
//       userName: options.userName,
//       language: getDeviceLanguage(),
//       region: getDeviceRegion(),
//       platform: 'Web',
//       transport: options.transport,
//       keys: options.keys,
//       sdkVersion: SDK_VERSION,
//       appVersion: getApplicationVersion(),
//       userAgent: navigator.userAgent,
//       timeZoneOffset: getTimeZoneOffset(),
//
//       // Submit a value when registering a temporary to prevent
//       // otherwise let the push module take over and update the setting accordingly.
//       allowedUI: options.transport === 'Notificare' ? false : undefined,
//     };
//
//     await registerCloudDevice({
//       environment: getCloudApiEnvironment(),
//       payload: registration,
//     });
//
//     const device = convertRegistrationToStoredDevice(registration, currentDevice);
//     setStoredDevice(device);
//   } else {
//     logger.info('Skipping device registration, nothing changed.');
//   }
//
//   if (getLaunchState() === LaunchState.LAUNCHED) {
//     const device = getStoredDevice();
//     if (device) notifyDeviceRegistered(device);
//   }
// }

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

function registrationChanged(): boolean {
  const device = getStoredDevice();

  if (!device) {
    logger.debug('Registration check: fresh installation');
    return true;
  }

  let changed = false;

  if (device.userAgent !== navigator.userAgent) {
    logger.debug('Registration check: user agent changed');
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

// function convertRegistrationToStoredDevice(
//   registration: CloudDeviceRegistrationPayload,
//   previousDevice: NotificareDevice | undefined,
// ): NotificareDevice {
//   return {
//     id: registration.deviceID,
//     userId: registration.userID,
//     userName: registration.userName,
//     timeZoneOffset: registration.timeZoneOffset,
//     sdkVersion: registration.sdkVersion,
//     appVersion: registration.appVersion,
//     language: registration.language,
//     region: registration.region,
//     transport: registration.transport as NotificareTransport,
//     keys:
//       registration.transport === 'Notificare'
//         ? undefined
//         : registration.keys ?? previousDevice?.keys,
//     dnd: previousDevice?.dnd,
//     userData: previousDevice?.userData ?? {},
//     lastRegistered: new Date().toISOString(),
//   };
// }
//
// interface InternalRegisterDeviceOptions {
//   transport: NotificareTransport;
//   token: string;
//   keys?: object;
//   userId?: string;
//   userName?: string;
// }
//
// interface InternalRegisterPushDeviceOptions {
//   readonly transport: Extract<NotificareTransport, 'WebPush' | 'WebsitePush'>;
//   readonly token: string;
//   readonly keys?: object;
// }
