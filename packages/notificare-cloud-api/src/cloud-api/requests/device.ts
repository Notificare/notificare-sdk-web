import {
  CloudCreateDevicePayload,
  CloudUpgradeToLongLivedDevicePayload,
} from '../payloads/device-registration';
import { CloudDeviceUpdatePayload } from '../payloads/device-update';
import { cloudRequest, CloudRequestParams } from '../request';
import { CloudCreateDeviceResponse } from '../responses/device';
import { CloudDeviceDoNotDisturbResponse } from '../responses/device-do-not-disturb';
import { CloudDeviceTagsResponse } from '../responses/device-tags';
import { CloudDeviceUserDataResponse } from '../responses/device-user-data';

export async function createCloudDevice(
  params: CreateCloudDeviceParams,
): Promise<CloudCreateDeviceResponse> {
  const { payload, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    method: 'POST',
    path: `/api/push`,
    body: payload,
  });

  return response.json();
}

export interface CreateCloudDeviceParams extends CloudRequestParams {
  payload: CloudCreateDevicePayload;
}

export async function upgradeToLongLivedCloudDevice(
  params: UpgradeToLongLivedCloudDeviceParams,
): Promise<Response> {
  const { payload, ...rest } = params;

  return cloudRequest({
    ...rest,
    method: 'POST',
    path: '/api/push',
    body: payload,
  });
}

export interface UpgradeToLongLivedCloudDeviceParams extends CloudRequestParams {
  payload: CloudUpgradeToLongLivedDevicePayload;
}

export async function updateCloudDevice(params: UpdateCloudDeviceParams): Promise<void> {
  const { deviceId, payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/push/${encodeURIComponent(deviceId)}`,
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
    path: `/api/push/${encodeURIComponent(deviceId)}/tags`,
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
    path: `/api/push/${encodeURIComponent(deviceId)}/addtags`,
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
    path: `/api/push/${encodeURIComponent(deviceId)}/removetags`,
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
    path: `/api/push/${encodeURIComponent(deviceId)}/cleartags`,
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
    path: `/api/push/${encodeURIComponent(deviceId)}/dnd`,
  });

  return response.json();
}

export interface FetchCloudDeviceDoNotDisturbParams extends CloudRequestParams {
  deviceId: string;
}

export async function fetchCloudDeviceUserData(
  params: FetchCloudDeviceUserDataParams,
): Promise<CloudDeviceUserDataResponse> {
  const { deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/push/${encodeURIComponent(deviceId)}/userdata`,
  });

  return response.json();
}

export interface FetchCloudDeviceUserDataParams extends CloudRequestParams {
  deviceId: string;
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
