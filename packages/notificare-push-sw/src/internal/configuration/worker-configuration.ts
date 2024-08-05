export interface WorkerConfiguration {
  applicationKey: string;
  applicationSecret: string;
  deviceId: string;
  useTestEnvironment?: boolean;
  standalone?: boolean;
}
