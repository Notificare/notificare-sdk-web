export function base64Encode(data: string): string {
  // eslint-disable-next-line no-restricted-globals
  return self.btoa(data);
}

export function base64Decode(data: string): string {
  // eslint-disable-next-line no-restricted-globals
  return self.atob(data);
}
