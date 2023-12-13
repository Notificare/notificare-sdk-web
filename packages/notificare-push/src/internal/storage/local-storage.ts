export function getRemoteNotificationsEnabled(): boolean {
  const enabledStr = localStorage.getItem('re.notifica.push.remote_notifications_enabled');
  if (!enabledStr) return false;

  return enabledStr === 'true';
}

export function setRemoteNotificationsEnabled(enabled: boolean | undefined) {
  if (!enabled) {
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
