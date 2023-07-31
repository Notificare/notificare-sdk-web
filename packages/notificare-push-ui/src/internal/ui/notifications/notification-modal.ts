import {
  createBackdrop,
  createButton,
  createModal,
  createModalContent,
  createModalFooter,
  createModalHeader,
  createRoot,
} from '@notificare/ui';
import { NotificareNotification, NotificareNotificationAction } from '@notificare/core';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';
import { getApplicationIcon, getApplicationName } from '../../utils';
import { createAlertContent } from './content/alert';
import { createImageContent } from './content/image';
import { createMapContent } from './content/map';
import { createUrlContent } from './content/url';
import { createVideoContent } from './content/video';
import { createWebViewContent } from './content/webview';

export async function createNotificationModal({
  notification,
  dismiss,
  presentAction,
}: CreateNotificationModalParams): Promise<HTMLElement> {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);

  root.appendChild(createBackdrop(() => dismiss()));

  const modal = root.appendChild(createModal());
  modal.classList.add('notificare__notification');
  modal.setAttribute('data-notification-type', notification.type);

  modal.appendChild(
    createModalHeader({
      icon: getApplicationIcon(),
      title: getApplicationName(),
      onCloseButtonClicked: () => dismiss(),
    }),
  );

  const content = modal.appendChild(createModalContent());
  content.appendChild(await createContentContainer(notification));

  if (notification.actions.length) {
    const footer = modal.appendChild(createModalFooter());
    footer.appendChild(createActionsContainer(notification, (action) => presentAction(action)));
  }

  return root;
}

export interface CreateNotificationModalParams {
  notification: NotificareNotification;
  dismiss: () => void;
  presentAction: (action: NotificareNotificationAction) => void;
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

function createActionsContainer(
  notification: NotificareNotification,
  onActionClick: (action: NotificareNotificationAction) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('notificare__notification-actions');

  if (notification.actions.length >= 3) {
    container.classList.add('notificare__notification-actions__list');
  }

  notification.actions.forEach((action, index) => {
    container.appendChild(
      createButton({
        variant: index === 0 ? 'primary' : 'secondary',
        text: action.label,
        onClick: () => onActionClick(action),
      }),
    );
  });

  return container;
}
