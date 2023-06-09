import { NotificareApplication, NotificareInternalOptions } from '@notificare/core';

export function createRootElement(): HTMLElement {
  const element = document.createElement('div');
  element.id = 'notificare-push-ui';
  element.classList.add('notificare');

  return element;
}

export function createBackdropElement(onClick: OnBackdropClicked): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.classList.add('notificare__notification-backdrop');

  backdrop.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    onClick();
  });

  return backdrop;
}

export function createModalElement(): HTMLElement {
  // header: ModalHeaderBuilder,
  // content: ModalContentBuilder,
  // footer: ModalFooterBuilder,
  const modal = document.createElement('div');
  modal.classList.add('notificare__notification');

  modal.addEventListener('click', (e) => {
    // Prevent the backdrop click to dismiss from receiving events when
    // the notification content is clicked.
    e.preventDefault();
  });

  return modal;
}

export function createModalHeaderElement(
  options: NotificareInternalOptions,
  application: NotificareApplication,
  onCloseButtonClicked: OnModalCloseButtonClicked,
): HTMLElement {
  const header = document.createElement('div');
  header.classList.add('notificare__notification-header');

  const logo = document.createElement('img');
  logo.classList.add('notificare__notification-header-logo');

  if (application.websitePushConfig?.icon) {
    logo.setAttribute(
      'src',
      `${options.services.awsStorageHost}${application.websitePushConfig.icon}`,
    );
  }

  header.appendChild(logo);

  const title = document.createElement('p');
  title.classList.add('notificare__notification-header-title');
  title.innerHTML = application.name;
  header.appendChild(title);

  const closeButton = document.createElement('div');
  closeButton.classList.add('notificare__notification-header-close-button');
  closeButton.addEventListener('click', onCloseButtonClicked);
  header.appendChild(closeButton);

  return header;
}

export function createModalContentElement(children: HTMLElement[]): HTMLElement {
  const content = document.createElement('div');
  content.classList.add('notificare__notification-content');

  children.forEach((child) => content.appendChild(child));

  return content;
}

export function createModalFooterElement(children: HTMLElement[]): HTMLElement {
  const footer = document.createElement('div');
  footer.classList.add('notificare__notification-actions');

  if (children.length > 2) {
    footer.classList.add('notificare__notification-actions__list');
  }

  children.forEach((child) => footer.appendChild(child));

  return footer;
}

export type OnBackdropClicked = () => void;
export type OnModalCloseButtonClicked = () => void;

export type ModalHeaderBuilder = () => HTMLElement | HTMLElement[] | undefined;
export type ModalContentBuilder = () => HTMLElement | HTMLElement[] | undefined;
export type ModalFooterBuilder = () => HTMLElement | HTMLElement[] | undefined;
