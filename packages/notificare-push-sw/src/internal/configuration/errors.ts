export class InvalidWorkerConfigurationError extends Error {
  constructor() {
    super('The service worker was not registered with the expected configuration.');
  }
}
