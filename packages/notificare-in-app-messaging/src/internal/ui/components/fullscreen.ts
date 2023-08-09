import { createBackdrop, createCloseButton, createRoot } from '@notificare/web-ui';
import { NotificareInAppMessage } from '../../../models/notificare-in-app-message';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';
import { ActionType } from '../../types/action-type';

export function createFullscreenComponent({
  message,
  dismiss,
  executeAction,
}: CreateFullscreenComponentParams): HTMLElement {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);

  const onWindowResize = () => {
    const element = document.getElementsByClassName('notificare__iam-fullscreen-image')[0];
    if (!element) return;

    const newImage = getOrientationConstrainedImage(message);
    if (!newImage || element.getAttribute('src') === newImage) return;

    element.setAttribute('src', newImage);
  };

  root.appendChild(createBackdrop(() => dismiss()));

  root.appendChild(
    createFullscreenElement({
      message,
      dismiss: () => {
        window.removeEventListener('resize', onWindowResize);
        dismiss();
      },
      executeAction: (type) => {
        window.removeEventListener('resize', onWindowResize);
        executeAction(type);
      },
    }),
  );

  window.addEventListener('resize', onWindowResize);

  return root;
}

export interface CreateFullscreenComponentParams {
  readonly message: NotificareInAppMessage;
  readonly dismiss: () => void;
  readonly executeAction: (type: ActionType) => void;
}

function createFullscreenElement({
  message,
  dismiss,
  executeAction,
}: CreateFullscreenComponentParams): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('notificare__iam-fullscreen');
  container.addEventListener('click', (e) => {
    // Click captured by the close button.
    if (e.defaultPrevented) return;

    // Prevent the backdrop from receiving events when content is clicked.
    e.preventDefault();

    // Execute the primary action.
    executeAction(ActionType.PRIMARY);
  });

  const image = getOrientationConstrainedImage(message);
  if (image) {
    const element = container.appendChild(document.createElement('img'));
    element.classList.add('notificare__iam-fullscreen-image');
    element.setAttribute('src', image);
  }

  container.appendChild(
    createCloseButton({
      variant: 'solid',
      onClick: () => dismiss(),
    }),
  );

  if (message.title || message.message) {
    const content = container.appendChild(document.createElement('div'));
    content.classList.add('notificare__iam-fullscreen-content');

    if (message.title) {
      const element = content.appendChild(document.createElement('p'));
      element.classList.add('notificare__iam-fullscreen-content-title');
      element.innerHTML = message.title;
    }

    if (message.message) {
      const element = content.appendChild(document.createElement('p'));
      element.classList.add('notificare__iam-fullscreen-content-message');
      element.innerHTML = message.message;
    }
  }

  return container;
}

function getOrientationConstrainedImage(message: NotificareInAppMessage): string | undefined {
  const isLandscape = window.innerWidth > window.innerHeight;
  if (isLandscape) return message.landscapeImage ?? message.image;

  return message.image ?? message.landscapeImage;
}
