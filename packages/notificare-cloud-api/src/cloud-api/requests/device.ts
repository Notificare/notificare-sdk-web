import { CloudDeviceDoNotDisturbResponse } from '../responses/device-do-not-disturb';
import { cloudRequest, CloudRequestParams } from '../request';
import { CloudDoNotDisturb } from '../models/do-not-disturb';
import { CloudDeviceUserDataResponse } from '../responses/device-user-data';
import { CloudUserData } from '../models/user-data';
import { CloudDeviceTagsResponse } from '../responses/device-tags';
import { CloudDeviceUpdatePayload } from '../payloads/device-update';
import { CloudDeviceRegistrationPayload } from '../payloads/device-registration';

export async function registerDevice(params: RegisterDeviceParams): Promise<void> {
  const { payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'POST',
    path: `/api/device`,
    body: payload,
  });
}

export interface RegisterDeviceParams extends CloudRequestParams {
  payload: CloudDeviceRegistrationPayload;
}

export async function updateDevice(params: UpdateDeviceParams): Promise<void> {
  const { deviceId, payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}`,
    body: payload,
  });
}

export interface UpdateDeviceParams extends CloudRequestParams {
  deviceId: string;
  payload: CloudDeviceUpdatePayload;
}

export async function deleteDevice(params: DeleteDeviceParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/device/${encodeURIComponent(deviceId)}`,
  });
}

export interface DeleteDeviceParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchDeviceTags(
  params: FetchDeviceTagsParams,
): Promise<CloudDeviceTagsResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/tags`,
  });

  return response.json();
}

export interface FetchDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
}

export async function addDeviceTags(params: UpdateDeviceTagsParams): Promise<void> {
  const { deviceId, tags, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/addtags`,
    body: { tags },
  });
}

export interface UpdateDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
  tags: string[];
}

export async function removeDeviceTags(params: RemoveDeviceTagsParams): Promise<void> {
  const { deviceId, tags, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/removetags`,
    body: { tags },
  });
}

export interface RemoveDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
  tags: string[];
}

export async function clearDeviceTags(params: ClearDeviceTagsParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/cleartags`,
  });
}

export interface ClearDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchDeviceDoNotDisturb(
  params: FetchDeviceDoNotDisturbParams,
): Promise<CloudDeviceDoNotDisturbResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/dnd`,
  });

  return response.json();
}

export interface FetchDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
}

export async function updateDeviceDoNotDisturb(
  params: UpdateDeviceDoNotDisturbParams,
): Promise<void> {
  const { deviceId, dnd, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/dnd`,
    body: dnd,
  });
}

export interface UpdateDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
  dnd: CloudDoNotDisturb;
}

export async function clearDeviceDoNotDisturb(
  params: ClearDeviceDoNotDisturbParams,
): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/cleardnd`,
  });
}

export interface ClearDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchDeviceUserData(
  params: FetchDeviceUserDataParams,
): Promise<CloudDeviceUserDataResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/userdata`,
  });

  return response.json();
}

export interface FetchDeviceUserDataParams extends CloudRequestParams {
  deviceId: string;
}

export async function updateDeviceUserData(params: UpdateDeviceUserDataParams): Promise<void> {
  const { deviceId, userData, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/userdata`,
    body: userData,
  });
}

export interface UpdateDeviceUserDataParams extends CloudRequestParams {
  deviceId: string;
  userData: CloudUserData;
}
