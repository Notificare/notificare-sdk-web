export const ROOT_ELEMENT_IDENTIFIER = 'notificare-push-ui';

export function ensureCleanState() {
  const root = document.getElementById(ROOT_ELEMENT_IDENTIFIER);
  if (root) root.remove();
}
