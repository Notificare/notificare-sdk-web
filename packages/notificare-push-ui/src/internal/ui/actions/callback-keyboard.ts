import {
  createBackdrop,
  createModal,
  createModalContent,
  createModalFooter,
  createModalHeader,
  createPrimaryButton,
  createRoot,
} from '@notificare/web-ui';
import { getApplicationIcon, getApplicationName } from '../../utils';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';

export function createKeyboardCallbackModal({
  dismiss,
  onTextCaptured,
}: CreateKeyboardCallbackParams): HTMLElement {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);

  root.appendChild(createBackdrop(() => dismiss()));

  const modal = root.appendChild(createModal());
  modal.classList.add('notificare__keyboard-callback');

  modal.appendChild(
    createModalHeader({
      icon: getApplicationIcon(),
      title: getApplicationName(),
      onCloseButtonClicked: () => dismiss(),
    }),
  );

  const content = modal.appendChild(createModalContent());

  const textarea = content.appendChild(document.createElement('textarea'));
  textarea.classList.add('notificare__keyboard-callback-textarea');
  textarea.setAttribute('placeholder', 'Type something...');
  // textarea.addEventListener('input', () => onTextChange(textarea.value));

  const footer = modal.appendChild(createModalFooter());
  footer.classList.add('notificare__modal-footer__callback');

  footer.appendChild(
    createPrimaryButton({
      text: 'Send',
      onClick: () => {
        onTextCaptured(textarea.value);
      },
    }),
  );

  return root;
}

interface CreateKeyboardCallbackParams {
  dismiss: () => void;
  onTextCaptured: (text: string) => void;
}
