export interface WorkerConfiguration {
  cloudHost: string;
  applicationId: string;
  applicationKey: string;
  applicationSecret: string;
  deviceId?: string;
  standalone?: boolean;
}
