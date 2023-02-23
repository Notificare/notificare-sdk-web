export function hasSafariPushSupport(): boolean {
  return window.safari?.pushNotification != null;
}

export async function enableSafariPushNotifications() {
  //
}
