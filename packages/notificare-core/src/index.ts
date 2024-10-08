import { registerComponents } from './register-components';

export * from './internal/cloud-api/environment';
export * from './internal/component';
export {
  registerComponent,
  broadcastComponentEvent,
  executeComponentCommand,
} from './internal/component-cache';
export { getOptions, NotificareInternalOptions } from './internal/options';
export { logInternal, logNotificationOpen } from './internal/internal-api-events';
export { convertCloudNotificationToPublic } from './internal/cloud-api/converters/notification-converter';

export { NotificareNetworkRequestError } from '@notificare/web-cloud-api';
export * from './errors/notificare-not-configured-error';
export * from './errors/notificare-application-unavailable-error';
export * from './errors/notificare-device-unavailable-error';
export * from './errors/notificare-not-ready-error';
export * from './errors/notificare-service-unavailable-error';

export * from './event-subscription';

export * from './models/notificare-application';
export * from './models/notificare-device';
export * from './models/notificare-do-not-disturb';
export * from './models/notificare-dynamic-link';
export * from './models/notificare-notification';
export * from './models/notificare-user-data';

export * from './public-api';
export * from './public-api-device';
export * from './public-api-events';
export * from './options';

export { loadStylesheet } from './internal/utils';

registerComponents();
