// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export function getServiceWorkerLocation(): WorkerLocation {
  return self.location;
}

export async function getCurrentPushToken(): Promise<string | undefined> {
  const subscription = await self.registration.pushManager.getSubscription();
  return subscription?.endpoint;
}

export function base64Encode(data: string): string {
  return self.btoa(data);
}

export function base64Decode(data: string): string {
  return self.atob(data);
}
