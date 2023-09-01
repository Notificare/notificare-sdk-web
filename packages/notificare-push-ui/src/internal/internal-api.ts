import { isConfigured, NotificareNotConfiguredError, request } from '@notificare/web-core';
import { NetworkPass, NetworkPassResponse } from './network/responses/pass-response';
import {
  NetworkSaveLinks,
  NetworkSaveLinksResponse,
} from './network/responses/save-links-response';

export async function fetchPass(serial: string): Promise<NetworkPass> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const response = await request(`/api/pass/forserial/${encodeURIComponent(serial)}`);

  const { pass }: NetworkPassResponse = await response.json();
  return pass;
}

export async function fetchPassSaveLinks(serial: string): Promise<NetworkSaveLinks | undefined> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const response = await request(`/api/pass/savelinks/${encodeURIComponent(serial)}`);

  const { saveLinks }: NetworkSaveLinksResponse = await response.json();
  return saveLinks;
}
