export const ROOT_ELEMENT_IDENTIFIER = 'notificare-in-app-messaging';

export function ensureCleanState() {
  const root = document.getElementById(ROOT_ELEMENT_IDENTIFIER);
  if (root) root.remove();
}
