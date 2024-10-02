import { base64Decode, base64Encode } from '../../utils/base64';
import { WorkerConfiguration } from './worker-configuration';

export function parseWorkerConfiguration(encoded: string): WorkerConfiguration | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any;

  try {
    const decoded = base64Decode(encoded);
    config = JSON.parse(decoded);
  } catch (e) {
    return undefined;
  }

  const { cloudHost } = config;
  if (!cloudHost) return undefined;

  const { applicationKey } = config;
  if (!applicationKey) return undefined;

  const { applicationSecret } = config;
  if (!applicationSecret) return undefined;

  return {
    cloudHost,
    applicationId: config.applicationKey,
    applicationKey,
    applicationSecret,
    deviceId: config.deviceId,
    standalone: config.standalone,
  };
}

export function encodeWorkerConfiguration(config: WorkerConfiguration): string {
  return base64Encode(JSON.stringify(config));
}
