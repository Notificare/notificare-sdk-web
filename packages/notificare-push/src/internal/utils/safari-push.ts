export function requestSafariPermission(
  websiteUrl: string,
  websiteIdentifier: string,
  queryParameters: Record<string, string>,
): Promise<SafariRemoteNotificationPermission> {
  return new Promise((resolve, reject) => {
    if (!window.safari) {
      reject(new Error('Safari not available in window.'));
      return;
    }

    try {
      window.safari.pushNotification.requestPermission(
        websiteUrl,
        websiteIdentifier,
        queryParameters,
        resolve,
      );
    } catch (e) {
      reject(e);
    }
  });
}
