import { WorkerConfiguration } from '../configuration/worker-configuration';

export function getCloudApiUrl({ useTestEnvironment }: WorkerConfiguration) {
  return useTestEnvironment ? 'https://cloud-test.notifica.re' : 'https://cloud.notifica.re';
}
