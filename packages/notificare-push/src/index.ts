import { registerComponents } from './register-components';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    safari?: {
      pushNotification: {
        permission: (uid: string) => SafariRemoteNotificationPermission;
        requestPermission: (
          websiteUrl: string,
          websiteIdentifier: string,
          queryParameters: Record<string, string>,
          callback: (permission: SafariRemoteNotificationPermission) => void,
        ) => void;
      };
    };
  }

  interface SafariRemoteNotificationPermission {
    deviceToken?: string | null;
    permission: 'default' | 'granted' | 'denied';
  }

  // noinspection JSUnusedGlobalSymbols
  interface Navigator {
    standalone?: boolean;
  }
}

export * from './public-api';

export * from './models/notificare-notification-delivery-mechanism';
export * from './models/notificare-system-notification';

export * from './utils/push';

registerComponents();
