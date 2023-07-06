export function createModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.classList.add('notificare__modal');

  modal.addEventListener('click', (e) => {
    // Prevent the backdrop from receiving events when content is clicked.
    e.preventDefault();
  });

  return modal;
}

export function createModalHeader({
  icon,
  title,
  onCloseButtonClicked,
}: ModalHeaderParams): HTMLElement {
  const headerElement = document.createElement('div');
  headerElement.classList.add('notificare__modal-header');

  if (icon) {
    const iconElement = document.createElement('img');
    iconElement.classList.add('notificare__modal-header-icon');
    iconElement.setAttribute('src', icon);
    headerElement.appendChild(iconElement);
  }

  const titleElement = document.createElement('p');
  titleElement.classList.add('notificare__modal-header-title');
  titleElement.innerHTML = title ?? '';
  headerElement.appendChild(titleElement);

  const closeButton = document.createElement('div');
  closeButton.classList.add('notificare__modal-header-close-button');
  closeButton.addEventListener('click', onCloseButtonClicked);
  headerElement.appendChild(closeButton);

  return headerElement;
}

export interface ModalHeaderParams {
  icon?: string;
  title?: string;
  onCloseButtonClicked: OnModalCloseButtonClicked;
}

export type OnModalCloseButtonClicked = () => void;

export function createModalContent(): HTMLElement {
  const content = document.createElement('div');
  content.classList.add('notificare__modal-content');

  return content;
}

export function createModalFooter(): HTMLElement {
  const footer = document.createElement('div');
  footer.classList.add('notificare__modal-footer');

  return footer;
}