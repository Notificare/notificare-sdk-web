export function getEmailUrl(email: string): string {
  return prefixed(email, 'mailto:');
}

export function getSmsUrl(phoneNumber: string): string {
  return prefixed(phoneNumber, 'sms:');
}

export function getTelephoneUrl(phoneNumber: string): string {
  return prefixed(phoneNumber, 'tel:');
}

function prefixed(value: string, prefix: string): string {
  if (value.startsWith(prefix)) return value;
  return `${prefix}${value}`;
}
