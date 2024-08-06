import { CloudAsset, CloudAssetButton } from '@notificare/web-cloud-api';
import { getOptions } from '@notificare/web-core';
import { NotificareAsset, NotificareAssetButton } from '../../models/notificare-asset';

export function convertCloudAssetToPublic(asset: CloudAsset): NotificareAsset {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: asset._id,
    title: asset.title,
    description: asset.description ?? undefined,
    key: asset.key ?? undefined,
    url: createAssetUrl(asset),
    button: convertCloudAssetButtonToPublic(asset.button),
    metaData: asset?.metaData,
    extra: asset.extra ?? {},
  };
}

function createAssetUrl({ key }: CloudAsset): string | undefined {
  const options = getOptions();
  if (!options || !key) return undefined;

  const host = options.hosts.restApi;
  return `https://${host}/asset/file/${key}`;
}

function convertCloudAssetButtonToPublic(
  button?: CloudAssetButton,
): NotificareAssetButton | undefined {
  if (!button) return undefined;
  if (!button.label && !button.action) return undefined;

  return {
    label: button.label,
    action: button.action,
  };
}
