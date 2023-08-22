import { createBackdrop, createRoot } from '@notificare/web-ui';
import { NotificareInAppMessage } from '../../../models/notificare-in-app-message';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';
import { ActionType } from '../../types/action-type';

export function createBannerComponent(params: CreateBannerComponentParams): HTMLElement {
  const { dismiss } = params;

  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);
  root.appendChild(createBackdrop(() => dismiss()));
  root.appendChild(createBannerElement(params));

  return root;
}

export interface CreateBannerComponentParams {
  readonly message: NotificareInAppMessage;
  readonly dismiss: () => void;
  readonly executeAction: (type: ActionType) => void;
}

function createBannerElement({ message, executeAction }: CreateBannerComponentParams): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('notificare__iam-banner');

  container.addEventListener('click', (e) => {
    // Prevent the backdrop from receiving events when content is clicked.
    e.preventDefault();

    // Execute the primary action.
    executeAction(ActionType.PRIMARY);
  });

  if (message.image) {
    const element = container.appendChild(document.createElement('img'));
    element.classList.add('notificare__iam-banner-image');
    element.setAttribute('src', message.image);
  }

  const content = container.appendChild(document.createElement('div'));
  content.classList.add('notificare__iam-banner-content');

  if (message.title) {
    const element = content.appendChild(document.createElement('p'));
    element.classList.add('notificare__iam-banner-content-title');
    element.innerHTML = message.title;
  }

  if (message.message) {
    const element = content.appendChild(document.createElement('p'));
    element.classList.add('notificare__iam-banner-content-message');
    element.innerHTML = message.message;
  }

  return container;
}
