export interface WorkerConfiguration {
  cloudHost: string;
  applicationId: string | undefined;
  applicationKey: string;
  applicationSecret: string;
  deviceId: string;
  standalone?: boolean;
}
