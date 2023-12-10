import { createBackdrop, createButton, createCloseButton, createRoot } from '@notificare/web-ui';
import {
  NotificareInAppMessage,
  NotificareInAppMessageAction,
} from '../../../models/notificare-in-app-message';
import { ActionType } from '../../types/action-type';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';

export function createCardComponent({
  message,
  dismiss,
  executeAction,
}: CreateCardComponentParams): HTMLElement {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);
  root.appendChild(createBackdrop(() => dismiss()));
  root.appendChild(
    createCardElement(
      message,
      () => dismiss(),
      (type) => executeAction(type),
    ),
  );

  return root;
}

export interface CreateCardComponentParams {
  readonly message: NotificareInAppMessage;
  readonly dismiss: () => void;
  readonly executeAction: (type: ActionType) => void;
}

function createCardElement(
  message: NotificareInAppMessage,
  onCloseButtonClick: () => void,
  onActionClick: OnActionClick,
): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('notificare__iam-card');

  container.addEventListener('click', (e) => {
    // Prevent the backdrop from receiving events when content is clicked.
    e.preventDefault();
  });

  container.appendChild(createHeaderElement(message, () => onCloseButtonClick()));
  container.appendChild(createContentElement(message));

  const actionsElement = createActionsElement(message, onActionClick);
  if (actionsElement) container.appendChild(actionsElement);

  return container;
}

function createHeaderElement(message: NotificareInAppMessage, dismiss: () => void): HTMLElement {
  const header = document.createElement('div');
  header.classList.add('notificare__iam-card-header');

  if (message.image) {
    const element = header.appendChild(document.createElement('img'));
    element.classList.add('notificare__iam-card-header-image');
    element.setAttribute('src', message.image);
  }

  header.appendChild(
    createCloseButton({
      variant: message.image ? 'solid' : 'default',
      onClick: () => dismiss(),
    }),
  );

  return header;
}

function createContentElement(message: NotificareInAppMessage): HTMLElement {
  const content = document.createElement('div');
  content.classList.add('notificare__iam-card-content');

  if (message.title) {
    const element = content.appendChild(document.createElement('p'));
    element.classList.add('notificare__iam-card-content-title');
    element.innerHTML = message.title;
  }

  if (message.message) {
    const element = content.appendChild(document.createElement('p'));
    element.classList.add('notificare__iam-card-content-message');
    element.innerHTML = message.message;
  }

  return content;
}

function createActionsElement(
  message: NotificareInAppMessage,
  onActionClick: OnActionClick,
): HTMLElement | undefined {
  const primaryActionButton = createActionButton({
    action: message.primaryAction,
    actionType: ActionType.PRIMARY,
    onClick: () => onActionClick(ActionType.PRIMARY),
  });

  const secondaryActionButton = createActionButton({
    action: message.secondaryAction,
    actionType: ActionType.SECONDARY,
    onClick: () => onActionClick(ActionType.SECONDARY),
  });

  if (!primaryActionButton && !secondaryActionButton) return undefined;

  const container = document.createElement('div');
  container.classList.add('notificare__iam-card-actions');

  if (primaryActionButton) container.appendChild(primaryActionButton);
  if (secondaryActionButton) container.appendChild(secondaryActionButton);

  return container;
}

function createActionButton({
  action,
  actionType,
  onClick,
}: {
  action: NotificareInAppMessageAction | undefined;
  actionType: ActionType;
  onClick: () => void;
}): HTMLElement | undefined {
  if (!action?.label || !action?.url) return undefined;

  const button = createButton({
    variant: action.destructive ? 'destructive' : actionType,
    text: action.label,
    onClick,
  });

  button.classList.add('notificare__iam-card-action');
  button.setAttribute('data-action-type', actionType);

  return button;
}

type OnActionClick = (actionType: ActionType) => void;
