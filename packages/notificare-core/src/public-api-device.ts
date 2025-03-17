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

/**
 * Provides the current registered device information.
 *
 * @returns {NotificareDevice | undefined} - The {@link NotificareDevice} object containing the
 * current registered device information, or 'undefined' in case no device is registered.
 */
export function getCurrentDevice(): NotificareDevice | undefined {
  const device = getStoredDevice();
  if (!device) return undefined;

  return asPublicDevice(device);
}

/**
 * Updates the user information for the device.
 *
 * To register the device anonymously, set both `userId` and `userName` to `null`.
 *
 * @param {UpdateUserOptions} userOptions - User options to be updated.
 * @param {string | null} userOptions.userId - Optional user identifier.
 * @param {string | null} userOptions.userName - Optional username.
 * @returns {Promise<void>} - A promise that resolves when the user information
 * has been successfully updated.
 */
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
 * Registers the device with an associated user, with a callback.
 *
 * To register the device anonymously, set both `userId` and `userName` to `null`.
 *
 * @param {RegisterDeviceOptions} options - A {@link RegisterDeviceOptions} object containing the
 * user ID and username to register.
 * @returns {Promise<void>} - A promise that resolves when the user has been
 * successfully registered.
 *
 * @deprecated Use updateUser() instead.
 */
export async function registerDevice(options: RegisterDeviceOptions): Promise<void> {
  await updateUser(options);
}

export type RegisterDeviceOptions = UpdateUserOptions;

/**
 * Provides the preferred language of the current device for notifications and messages.
 *
 * @returns {string | undefined} - The preferred language code, or `undefined` if no preferred
 * language is set.
 */
export function getPreferredLanguage(): string | undefined {
  const preferredLanguage = localStorage.getItem('re.notifica.preferred_language');
  if (!preferredLanguage) return undefined;

  const preferredRegion = localStorage.getItem('re.notifica.preferred_region');
  if (!preferredRegion) return undefined;

  return `${preferredLanguage}-${preferredRegion}`;
}

/**
 * Updates the preferred language setting for the device, with a callback.
 *
 * @param {string | null} language - The preferred language code, or `null` to clear the set
 * preferred language.
 * @returns {Promise<void>} - A promise that resolves when the preferred language
 * has been successfully updated.
 */
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

/**
 * Fetches the tags associated with the device.
 *
 * @return {Promise<string[]>} - A promise that resolves to a list of tags currently associated with
 * the device.
 */
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

/**
 * Adds a single tag to the device.
 *
 * @param {string} tag - The tag to add.
 * @returns {Promise<void>} - A promise that resolves when the tag has been
 * successfully added to the device.
 */
export async function addTag(tag: string): Promise<void> {
  await addTags([tag]);
}

/**
 * Adds multiple tags to the device.
 *
 * @param {string[]} tags - A list of tags to add.
 * @returns {Promise<void>} - A promise that resolves when all the tags have
 * been successfully added to the device.
 */
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

/**
 * Removes a specific tag from the device.
 *
 * @param {string} tag - The tag to remove.
 * @returns {Promise<void>} - A promise that resolves when the tag has been
 * successfully removed from the device.
 */
export async function removeTag(tag: string): Promise<void> {
  await removeTags([tag]);
}

/**
 * Removes multiple tags from the device.
 *
 * @param {string[]} tags - A list of tags to remove.
 * @returns {Promise<void>} - A promise that resolves when all the specified tags
 * have been successfully removed from the device.
 */
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

/**
 * Clears all tags from the device.
 *
 * @returns {Promise<void>} - A promise that resolves when all tags have been
 * successfully cleared from the device.
 */
export async function clearTags(): Promise<void> {
  checkPrerequisites();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await clearCloudDeviceTags({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });
}

/**
 * Fetches the "Do Not Disturb" (DND) settings for the device.
 *
 * @return {Promise<NotificareDoNotDisturb | undefined>} - A promise that resolves to a
 * {@link NotificareDoNotDisturb} object containing the current DND settings, or `null` if none are
 * set.
 *
 * @see {@link NotificareDoNotDisturb}
 */
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

/**
 * Updates the "Do Not Disturb" (DND) settings for the device.
 *
 * @param {NotificareDoNotDisturb} dnd - The new DND settings to apply.
 * @returns {Promise<void>} - A promise that resolves when the DND settings
 * have been successfully updated.
 *
 * @see {@link NotificareDoNotDisturb}
 */
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

/**
 * Clears the "Do Not Disturb" (DND) settings for the device.
 *
 * @returns {Promise<void>} - A promise that resolves when the DND settings
 * have been successfully cleared.
 */
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

/**
 * Fetches the user data associated with the device.
 *
 * @return {Promise<NotificareUserData>} - A promise that resolves to a {@link NotificareUserData}
 * object containing the current user data.
 *
 * @see {@link NotificareUserData}
 */
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

/**
 * Updates the custom user data associated with the device.
 *
 * @param {Record<string, string | null>} userData - The updated user data to associate
 * with the device.
 * @returns {Promise<void>} - A promise that resolves when the user data has
 * been successfully updated.
 */
export async function updateUserData(userData: Record<string, string | null>): Promise<void> {
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
    userData: Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value != null),
    ) as Record<string, string>,
  });
}
