const PUSH_ROOT_ELEMENT_IDENTIFIER = 'notificare-push';
const PUSH_ONBOARDING_CLASS_NAME = 'notificare-push-onboarding';

const PUSH_UI_ROOT_ELEMENT_IDENTIFIER = 'notificare-push-ui';

export function isShowingPushOnboarding(): boolean {
  const element = document.getElementById(PUSH_ROOT_ELEMENT_IDENTIFIER);
  if (!element) return false;

  return element.classList.contains(PUSH_ONBOARDING_CLASS_NAME);
}

export function isShowingNotification(): boolean {
  return document.getElementById(PUSH_UI_ROOT_ELEMENT_IDENTIFIER) != null;
}
