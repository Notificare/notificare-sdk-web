export interface CloudAsset {
  readonly _id: string;
  readonly title: string;
  readonly description?: string;
  readonly key?: string;
  readonly button?: CloudAssetButton;
  readonly metaData?: CloudAssetMetaData;
  readonly extra?: CloudAssetExtra;
}

export interface CloudAssetButton {
  readonly label?: string;
  readonly action?: string;
}

export interface CloudAssetMetaData {
  readonly originalFileName: string;
  readonly contentType: string;
  readonly contentLength: number;
}

export type CloudAssetExtra = Record<string, unknown>;
