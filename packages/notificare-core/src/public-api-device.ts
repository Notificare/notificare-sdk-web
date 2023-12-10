import {
  addCloudDeviceTags,
  clearCloudDeviceDoNotDisturb,
  clearCloudDeviceTags,
  fetchCloudDeviceDoNotDisturb,
  fetchCloudDeviceTags,
  fetchCloudDeviceUserData,
  removeCloudDeviceTags,
  updateCloudDevice,
  updateCloudDeviceDoNotDisturb,
  updateCloudDeviceUserData,
} from '@notificare/web-cloud-api';
import {
  checkPrerequisites,
  getDeviceLanguage,
  getDeviceRegion,
  registerDeviceInternal,
} from './internal/internal-api-device';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';
import { NotificareDoNotDisturb } from './models/notificare-do-not-disturb';
import { NotificareDeviceUnavailableError } from './errors/notificare-device-unavailable-error';
import { NotificareUserData } from './models/notificare-user-data';
import { getCurrentDevice, storeCurrentDevice } from './internal/storage/local-storage';
import { getCloudApiEnvironment } from './internal/cloud-api/environment';

export { getCurrentDevice } from './internal/storage/local-storage';

export async function registerDevice(options: RegisterDeviceOptions): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareNotReadyError();

  await registerDeviceInternal({
    transport: device.transport,
    token: device.id,
    keys: device.keys,
    userId: options.userId ?? undefined,
    userName: options.userName ?? undefined,
  });
}

export function getPreferredLanguage(): string | undefined {
  const preferredLanguage = localStorage.getItem('re.notifica.preferred_language');
  if (!preferredLanguage) return undefined;

  const preferredRegion = localStorage.getItem('re.notifica.preferred_region');
  if (!preferredRegion) return undefined;

  return `${preferredLanguage}-${preferredRegion}`;
}

export async function updatePreferredLanguage(language: string | null): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
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

  const device = getCurrentDevice();
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

  const device = getCurrentDevice();
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

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await removeCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    tags,
  });
}

export async function clearTags(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await clearCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });
}

export async function fetchDoNotDisturb(): Promise<NotificareDoNotDisturb | undefined> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { dnd } = await fetchCloudDeviceDoNotDisturb({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    dnd: dnd ?? undefined,
  });

  return dnd ?? undefined;
}

export async function updateDoNotDisturb(dnd: NotificareDoNotDisturb): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await updateCloudDeviceDoNotDisturb({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    dnd,
  });

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    dnd,
  });
}

export async function clearDoNotDisturb(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await clearCloudDeviceDoNotDisturb({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    dnd: undefined,
  });
}

export async function fetchUserData(): Promise<NotificareUserData> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { userData } = await fetchCloudDeviceUserData({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    userData: userData ?? {},
  });

  return userData ?? {};
}

export async function updateUserData(userData: NotificareUserData): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await updateCloudDeviceUserData({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    userData,
  });

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    userData,
  });
}

export interface RegisterDeviceOptions {
  userId: string | null;
  userName: string | null;
}
