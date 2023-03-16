export function base64UrlToUint8Array(base64UrlData: string): Uint8Array {
  const padding = '='.repeat((4 - (base64UrlData.length % 4)) % 4);
  const base64 = (base64UrlData + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    buffer[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64Url(new Uint8Array(buffer));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64(new Uint8Array(buffer));
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  return uint8ArrayToBase64(bytes).replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/g, '');
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let rawData = '';

  for (let i = 0; i < bytes.byteLength; i += 1) {
    rawData += String.fromCharCode(bytes[i]);
  }

  return btoa(rawData);
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
