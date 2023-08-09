import { getOptions } from '@notificare/web-core';
import { NotificareAsset, NotificareAssetButton } from '../../../models/notificare-asset';

export interface NetworkAssetsResponse {
  readonly assets: NetworkAsset[];
}

export interface NetworkAsset {
  readonly _id: string;
  readonly title: string;
  readonly description?: string;
  readonly key?: string;
  readonly button?: NetworkAssetButton;
  readonly metaData?: NetworkAssetMetaData;
  readonly extra?: Record<string, unknown>;
}

export interface NetworkAssetButton {
  readonly label?: string;
  readonly action?: string;
}

export interface NetworkAssetMetaData {
  readonly originalFileName: string;
  readonly contentType: string;
  readonly contentLength: number;
}

export function convertNetworkAssetToPublic(asset: NetworkAsset): NotificareAsset {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: asset._id,
    title: asset.title,
    description: asset.description ?? undefined,
    key: asset.key ?? undefined,
    url: createAssetUrl(asset),
    button: convertNetworkAssetButtonToPublic(asset.button),
    metaData: asset?.metaData,
    extra: asset.extra ?? {},
  };
}

function createAssetUrl({ key }: NetworkAsset): string | undefined {
  const options = getOptions();
  if (!options) return undefined;

  const host = options.services.pushHost;
  return `${host}/asset/file/${key}`;
}

function convertNetworkAssetButtonToPublic(
  button?: NetworkAssetButton,
): NotificareAssetButton | undefined {
  if (!button) return undefined;
  if (!button.label && !button.action) return undefined;

  return {
    label: button.label,
    action: button.action,
  };
}
