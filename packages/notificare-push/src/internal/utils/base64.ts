export function base64Encode(data: string): string {
  return window.btoa(data);
}

export function base64Decode(data: string): string {
  return window.atob(data);
}
