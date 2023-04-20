import { registerComponents } from './register-components';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    safari?: {
      pushNotification: {
        permission: (uid: string) => {
          deviceToken?: string | null;
          permission: 'default' | 'granted' | 'denied';
        };
        // TODO: typesafe requestPermission()
      };
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface Navigator {
    standalone?: boolean;
  }
}

export * from './public-api';

registerComponents();
