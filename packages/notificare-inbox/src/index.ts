import { registerComponents } from './register-components';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Navigator {
    setAppBadge?: (badge: number) => void;
    setClientBadge?: (badge: number) => void;
  }
}

export * from './errors/notificare-auto-badge-unavailable-error';

export * from './models/notificare-inbox-response';
export * from './models/notificare-inbox-item';

export * from './public-api';

registerComponents();
