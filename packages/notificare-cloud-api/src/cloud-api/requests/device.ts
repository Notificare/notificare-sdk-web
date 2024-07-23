import { CloudDoNotDisturb } from '../models/do-not-disturb';
import { CloudUserData } from '../models/user-data';
import { CloudDeviceRegistrationPayload } from '../payloads/device-registration';
import { CloudDeviceUpdatePayload } from '../payloads/device-update';
import { cloudRequest, CloudRequestParams } from '../request';
import { CloudDeviceDoNotDisturbResponse } from '../responses/device-do-not-disturb';
import { CloudDeviceTagsResponse } from '../responses/device-tags';
import { CloudDeviceUserDataResponse } from '../responses/device-user-data';

export async function registerCloudDevice(params: RegisterCloudDeviceParams): Promise<void> {
  const { payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'POST',
    path: `/api/device`,
    body: payload,
  });
}

export interface RegisterCloudDeviceParams extends CloudRequestParams {
  payload: CloudDeviceRegistrationPayload;
}

export async function updateCloudDevice(params: UpdateCloudDeviceParams): Promise<void> {
  const { deviceId, payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}`,
    body: payload,
  });
}

export interface UpdateCloudDeviceParams extends CloudRequestParams {
  deviceId: string;
  payload: CloudDeviceUpdatePayload;
}

export async function deleteCloudDevice(params: DeleteCloudDeviceParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/push/${encodeURIComponent(deviceId)}`,
  });
}

export interface DeleteCloudDeviceParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchCloudDeviceTags(
  params: FetchCloudDeviceTagsParams,
): Promise<CloudDeviceTagsResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/tags`,
  });

  return response.json();
}

export interface FetchCloudDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
}

export async function addCloudDeviceTags(params: UpdateCloudDeviceTagsParams): Promise<void> {
  const { deviceId, tags, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/addtags`,
    body: { tags },
  });
}

export interface UpdateCloudDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
  tags: string[];
}

export async function removeCloudDeviceTags(params: RemoveCloudDeviceTagsParams): Promise<void> {
  const { deviceId, tags, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/removetags`,
    body: { tags },
  });
}

export interface RemoveCloudDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
  tags: string[];
}

export async function clearCloudDeviceTags(params: ClearCloudDeviceTagsParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/cleartags`,
  });
}

export interface ClearCloudDeviceTagsParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchCloudDeviceDoNotDisturb(
  params: FetchCloudDeviceDoNotDisturbParams,
): Promise<CloudDeviceDoNotDisturbResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/dnd`,
  });

  return response.json();
}

export interface FetchCloudDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
}

export async function updateCloudDeviceDoNotDisturb(
  params: UpdateCloudDeviceDoNotDisturbParams,
): Promise<void> {
  const { deviceId, dnd, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/dnd`,
    body: dnd,
  });
}

export interface UpdateCloudDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
  dnd: CloudDoNotDisturb;
}

export async function clearCloudDeviceDoNotDisturb(
  params: ClearCloudDeviceDoNotDisturbParams,
): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/cleardnd`,
  });
}

export interface ClearCloudDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchCloudDeviceUserData(
  params: FetchCloudDeviceUserDataParams,
): Promise<CloudDeviceUserDataResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/device/${encodeURIComponent(deviceId)}/userdata`,
  });

  return response.json();
}

export interface FetchCloudDeviceUserDataParams extends CloudRequestParams {
  deviceId: string;
}

export async function updateCloudDeviceUserData(
  params: UpdateCloudDeviceUserDataParams,
): Promise<void> {
  const { deviceId, userData, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/device/${encodeURIComponent(deviceId)}/userdata`,
    body: userData,
  });
}

export interface UpdateCloudDeviceUserDataParams extends CloudRequestParams {
  deviceId: string;
  userData: CloudUserData;
}

export async function registerCloudTestDevice(params: RegisterCloudTestDevice): Promise<void> {
  const { deviceId, nonce, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/support/testdevice/${encodeURIComponent(nonce)}`,
    body: { deviceID: deviceId },
  });
}

export interface RegisterCloudTestDevice extends CloudRequestParams {
  deviceId: string;
  nonce: string;
}
