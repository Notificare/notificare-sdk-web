import {
  addCloudDeviceTags,
  clearCloudDeviceTags,
  fetchCloudDeviceDoNotDisturb,
  fetchCloudDeviceTags,
  fetchCloudDeviceUserData,
  removeCloudDeviceTags,
  updateCloudDevice,
} from '@notificare/web-cloud-api';
import { NotificareDeviceUnavailableError } from './errors/notificare-device-unavailable-error';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';
import { getCloudApiEnvironment } from './internal/cloud-api/environment';
import {
  checkPrerequisites,
  getDeviceLanguage,
  getDeviceRegion,
} from './internal/internal-api-device';
import { asPublicDevice, getStoredDevice, setStoredDevice } from './internal/storage/local-storage';
import { NotificareDevice } from './models/notificare-device';
import { NotificareDoNotDisturb } from './models/notificare-do-not-disturb';
import { NotificareUserData } from './models/notificare-user-data';

export function getCurrentDevice(): NotificareDevice | undefined {
  const device = getStoredDevice();
  if (!device) return undefined;

  return asPublicDevice(device);
}

export async function updateUser({ userId, userName }: UpdateUserOptions): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareNotReadyError();

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      userID: userId ?? null,
      userName: userName ?? null,
    },
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    userId: userId ?? undefined,
    userName: userName ?? undefined,
  });
}

export interface UpdateUserOptions {
  readonly userId: string | null;
  readonly userName: string | null;
}

/**
 * @deprecated Use updateUser() instead.
 *
 * @param options
 */
export async function registerDevice(options: RegisterDeviceOptions): Promise<void> {
  await updateUser(options);
}

export type RegisterDeviceOptions = UpdateUserOptions;

export function getPreferredLanguage(): string | undefined {
  const preferredLanguage = localStorage.getItem('re.notifica.preferred_language');
  if (!preferredLanguage) return undefined;

  const preferredRegion = localStorage.getItem('re.notifica.preferred_region');
  if (!preferredRegion) return undefined;

  return `${preferredLanguage}-${preferredRegion}`;
}

export async function updatePreferredLanguage(language: string | null): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  if (language) {
    const parts = language.split('-');
    if (parts.length !== 2) {
      throw new Error(
        `${language} is not a valid language. Use a ISO 639-1 language code and a ISO 3166-2 region code (e.g. en-US).`,
      );
    }

    localStorage.setItem('re.notifica.preferred_language', parts[0]);
    localStorage.setItem('re.notifica.preferred_region', parts[1]);
  } else {
    localStorage.removeItem('re.notifica.preferred_language');
    localStorage.removeItem('re.notifica.preferred_region');
  }

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      language: getDeviceLanguage(),
      region: getDeviceRegion(),
    },
  });
}

export async function fetchTags(): Promise<string[]> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { tags } = await fetchCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  return tags ?? [];
}

export async function addTag(tag: string): Promise<void> {
  await addTags([tag]);
}

export async function addTags(tags: string[]): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await addCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    tags,
  });
}

export async function removeTag(tag: string): Promise<void> {
  await removeTags([tag]);
}

export async function removeTags(tags: string[]): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await removeCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    tags,
  });
}

export async function clearTags(): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await clearCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });
}

export async function fetchDoNotDisturb(): Promise<NotificareDoNotDisturb | undefined> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { dnd } = await fetchCloudDeviceDoNotDisturb({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    dnd: dnd ?? undefined,
  });

  return dnd ?? undefined;
}

export async function updateDoNotDisturb(dnd: NotificareDoNotDisturb): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      dnd,
    },
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    dnd,
  });
}

export async function clearDoNotDisturb(): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      dnd: null,
    },
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    dnd: undefined,
  });
}

export async function fetchUserData(): Promise<NotificareUserData> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { userData } = await fetchCloudDeviceUserData({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    userData: userData ?? {},
  });

  return userData ?? {};
}

export async function updateUserData(userData: NotificareUserData): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      userData,
    },
  });

  // Update current device properties.
  setStoredDevice({
    ...device,
    userData,
  });
}
