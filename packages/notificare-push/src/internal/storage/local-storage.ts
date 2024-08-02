import { NotificareTransport } from '../../models/notificare-transport';

export function getRemoteNotificationsEnabled(): boolean | undefined {
  const enabledStr = localStorage.getItem('re.notifica.push.remote_notifications_enabled');
  if (!enabledStr) return undefined;

  return enabledStr === 'true';
}

export function setRemoteNotificationsEnabled(enabled: boolean | undefined) {
  if (enabled === undefined) {
    localStorage.removeItem('re.notifica.push.remote_notifications_enabled');
    return;
  }

  localStorage.setItem('re.notifica.push.remote_notifications_enabled', enabled.toString());
}

export function retrieveAllowedUI(): boolean | undefined {
  const allowedUIStr = localStorage.getItem('re.notifica.push.allowed_ui');
  if (!allowedUIStr) return undefined;

  return allowedUIStr === 'true';
}

export function storeAllowedUI(allowedUI: boolean | undefined) {
  if (!allowedUI) {
    localStorage.removeItem('re.notifica.push.allowed_ui');
    return;
  }

  localStorage.setItem('re.notifica.push.allowed_ui', allowedUI.toString());
}

export function retrieveTransport(): NotificareTransport | undefined {
  const transport = localStorage.getItem('re.notifica.push.transport');
  if (!transport) return undefined;

  return transport as NotificareTransport;
}

export function storeTransport(transport: NotificareTransport | undefined) {
  if (transport === undefined) {
    localStorage.removeItem('re.notifica.push.transport');
    return;
  }

  localStorage.setItem('re.notifica.push.transport', transport);
}

export function retrieveSubscriptionId(): string | undefined {
  return localStorage.getItem('re.notifica.push.subscription_id') ?? undefined;
}

export function storeSubscriptionId(subscriptionId: string | undefined) {
  if (subscriptionId === undefined) {
    localStorage.removeItem('re.notifica.push.subscription_id');
    return;
  }

  localStorage.setItem('re.notifica.push.subscription_id', subscriptionId);
}
