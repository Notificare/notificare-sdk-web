import { createRoot } from '@notificare/web-ui';

export const ROOT_DOM_IDENTIFIER = 'notificare-push';

export function createRootElement(): HTMLElement {
  return createRoot(ROOT_DOM_IDENTIFIER);
}

export function removeRootElement() {
  const root = document.getElementById(ROOT_DOM_IDENTIFIER);
  if (root) root.remove();
}
