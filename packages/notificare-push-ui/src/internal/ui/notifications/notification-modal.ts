import {
  createBackdrop,
  createModal,
  createModalContent,
  createModalFooter,
  createModalHeader,
  createRoot,
} from '@notificare/ui';
import { NotificareNotification } from '@notificare/core';
import { ensureCleanState, ROOT_ELEMENT_IDENTIFIER } from '../root';
import { getApplicationIcon, getApplicationName } from '../../utils';
import { createAlertContent } from './content/alert';
import { createImageContent } from './content/image';
import { createMapContent } from './content/map';
import { createUrlContent } from './content/url';
import { createVideoContent } from './content/video';
import { createWebViewContent } from './content/webview';

export async function createNotificationModal({
  notification,
}: CreateNotificationModalParams): Promise<HTMLElement> {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);

  root.appendChild(createBackdrop(() => ensureCleanState()));

  const modal = root.appendChild(createModal());
  modal.classList.add('notificare__notification');
  modal.setAttribute('data-notification-type', notification.type);

  modal.appendChild(
    createModalHeader({
      icon: getApplicationIcon(),
      title: getApplicationName(),
      onCloseButtonClicked: () => ensureCleanState(),
    }),
  );

  const content = modal.appendChild(createModalContent());
  content.appendChild(await createContentContainer(notification));

  const actionsContainer = createActionsContainer(notification);
  if (actionsContainer) {
    const footer = modal.appendChild(createModalFooter());
    footer.appendChild(actionsContainer);
  }

  return root;
}

export interface CreateNotificationModalParams {
  notification: NotificareNotification;
}

async function createContentContainer(notification: NotificareNotification): Promise<HTMLElement> {
  switch (notification.type) {
    case 're.notifica.notification.Alert':
      return createAlertContent(notification);
    case 're.notifica.notification.Image':
      return createImageContent(notification);
    case 're.notifica.notification.Map':
      return createMapContent(notification);
    case 're.notifica.notification.URL':
      return createUrlContent(notification);
    case 're.notifica.notification.Video':
      return createVideoContent(notification);
    case 're.notifica.notification.WebView':
      return createWebViewContent(notification);
    default:
      throw new Error(`Unsupported notification type: ${notification.type}`);
  }
}

function createActionsContainer(notification: NotificareNotification): HTMLElement | undefined {
  if (!notification.actions.length) return undefined;

  return undefined;
}
