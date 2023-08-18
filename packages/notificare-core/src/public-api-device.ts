import {
  checkPrerequisites,
  getDeviceLanguage,
  getDeviceRegion,
  registerDeviceInternal,
} from './internal/internal-api-device';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';
import { NotificareDoNotDisturb } from './models/notificare-do-not-disturb';
import { NotificareDeviceUnavailableError } from './errors/notificare-device-unavailable-error';
import { request } from './internal/network/request';
import { NetworkDeviceTagsResponse } from './internal/network/responses/device-tags-response';
import { DeviceDoNotDisturbResponse } from './internal/network/responses/device-do-not-disturb-response';
import { NotificareUserData } from './models/notificare-user-data';
import { DeviceUserDataResponse } from './internal/network/responses/device-user-data-response';
import { getCurrentDevice, storeCurrentDevice } from './internal/storage/local-storage';

export { getCurrentDevice } from './internal/storage/local-storage';

export async function registerDevice(options: RegisterDeviceOptions): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareNotReadyError();

  await registerDeviceInternal({
    transport: device.transport,
    token: device.id,
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

  await request(`/api/device/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
    body: {
      language: getDeviceLanguage(),
      region: getDeviceRegion(),
    },
  });
}

export async function fetchTags(): Promise<string[]> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const response = await request(`/api/device/${encodeURIComponent(device.id)}/tags`);
  const { tags }: NetworkDeviceTagsResponse = await response.json();

  return tags ?? [];
}

export async function addTag(tag: string): Promise<void> {
  await addTags([tag]);
}

export async function addTags(tags: string[]): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}/addtags`, {
    method: 'PUT',
    body: {
      tags,
    },
  });
}

export async function removeTag(tag: string): Promise<void> {
  await removeTags([tag]);
}

export async function removeTags(tags: string[]): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}/removetags`, {
    method: 'PUT',
    body: {
      tags,
    },
  });
}

export async function clearTags(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}/cleartags`, {
    method: 'PUT',
  });
}

export async function fetchDoNotDisturb(): Promise<NotificareDoNotDisturb | undefined> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const response = await request(`/api/device/${encodeURIComponent(device.id)}/dnd`);
  const { dnd }: DeviceDoNotDisturbResponse = await response.json();

  // Update current device properties.
  storeCurrentDevice({
    ...device,
    dnd,
  });

  return dnd;
}

export async function updateDoNotDisturb(dnd: NotificareDoNotDisturb): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}/dnd`, {
    method: 'PUT',
    body: dnd,
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

  await request(`/api/device/${encodeURIComponent(device.id)}/cleardnd`, {
    method: 'PUT',
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

  const response = await request(`/api/device/${encodeURIComponent(device.id)}/userdata`);
  const { userData }: DeviceUserDataResponse = await response.json();

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

  await request(`/api/device/${encodeURIComponent(device.id)}/userdata`, {
    method: 'PUT',
    body: userData,
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
