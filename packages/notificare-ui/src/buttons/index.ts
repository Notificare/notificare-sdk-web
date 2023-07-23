export function createPrimaryButton(params: InvariantButtonParams): ButtonElement {
  return createButton({
    variant: 'primary',
    ...params,
  });
}

export function createSecondaryButton(params: InvariantButtonParams): ButtonElement {
  return createButton({
    variant: 'secondary',
    ...params,
  });
}

export function createDestructiveButton(params: InvariantButtonParams): ButtonElement {
  return createButton({
    variant: 'destructive',
    ...params,
  });
}

export function createButton({ variant, text, onClick }: ButtonParams): HTMLButtonElement {
  const button = document.createElement('button');
  button.classList.add('notificare__button', ButtonVariantCssClassMap[variant]);
  button.innerText = text;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    onClick();
  });

  return button;
}

export type ButtonElement = HTMLElement;
export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface ButtonParams {
  readonly variant: ButtonVariant;
  readonly text: string;
  readonly onClick: () => void;
}

export type InvariantButtonParams = Omit<ButtonParams, 'variant'>;

const ButtonVariantCssClassMap: Record<ButtonVariant, string> = {
  primary: 'notificare__button--primary',
  secondary: 'notificare__button--secondary',
  destructive: 'notificare__button--destructive',
};

export function createCloseButton({ variant, onClick }: CloseButtonParams): ButtonElement {
  const button = document.createElement('button');
  button.classList.add('notificare__close-button');
  if (variant === 'solid') button.classList.add('notificare__close-button--solid');

  button.addEventListener('click', (e) => {
    e.preventDefault();
    onClick();
  });

  return button;
}

export type CloseButtonVariant = 'default' | 'solid';

interface CloseButtonParams {
  readonly variant?: CloseButtonVariant;
  readonly onClick: () => void;
}
