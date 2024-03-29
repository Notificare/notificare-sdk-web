export interface NotificareAsset {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly key?: string;
  readonly url?: string;
  readonly button?: NotificareAssetButton;
  readonly metaData?: NotificareAssetMetaData;
  readonly extra: Record<string, unknown>;
}

export interface NotificareAssetButton {
  readonly label?: string;
  readonly action?: string;
}

export interface NotificareAssetMetaData {
  readonly originalFileName: string;
  readonly contentType: string;
  readonly contentLength: number;
}
