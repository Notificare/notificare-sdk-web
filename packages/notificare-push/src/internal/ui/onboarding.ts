import {
  getOptions,
  NotificareApplication,
  NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
} from '@notificare/web-core';
import {
  createBackdrop,
  createDestructiveButton,
  createModal,
  createModalContent,
  createModalFooter,
  createPrimaryButton,
  createRoot,
} from '@notificare/web-ui';
import createNotificareLogo from '../../assets/notificare-logo.svg';

export function showOnboarding({
  application,
  autoOnboardingOptions,
  onAcceptClicked,
  onCancelClicked,
}: ShowAutoBoardingOptions) {
  const options = getOptions();
  if (!options) return;

  ensureCleanState();

  const root = createRoot('notificare-push');
  root.classList.add('notificare-push-onboarding');

  root.appendChild(
    createBackdrop(() => {
      ensureCleanState();
      onCancelClicked();
    }),
  );

  const modal = root.appendChild(createModal({ alignment: 'top' }));
  modal.classList.add('notificare__onboarding-modal');

  const content = modal.appendChild(createModalContent());
  content.classList.add('notificare__onboarding-content');

  if (application.websitePushConfig?.icon) {
    const icon = content.appendChild(document.createElement('img'));
    icon.classList.add('notificare__onboarding-icon');

    icon.setAttribute(
      'src',
      `${options.services.awsStorageHost}${application.websitePushConfig.icon}`,
    );
  }

  const textContent = content.appendChild(document.createElement('div'));
  textContent.classList.add('notificare__onboarding-text-content');

  const title = textContent.appendChild(document.createElement('p'));
  title.classList.add('notificare__onboarding-title');
  title.innerHTML = application.name;

  const text = textContent.appendChild(document.createElement('p'));
  text.classList.add('notificare__onboarding-text');
  text.innerHTML = autoOnboardingOptions.message;

  const footer = modal.appendChild(createModalFooter());
  footer.classList.add('notificare__onboarding-footer');

  if (application.branding) {
    const brandingContainer = footer.appendChild(document.createElement('a'));
    brandingContainer.classList.add('notificare__onboarding-branding-content');
    brandingContainer.setAttribute('href', 'https://notificare.com');
    brandingContainer.setAttribute('target', '_blank');

    const brandingText = brandingContainer.appendChild(document.createElement('p'));
    brandingText.classList.add('notificare__onboarding-branding');
    brandingText.innerHTML = 'powered by';

    const brandingLogo = brandingContainer.appendChild(createNotificareLogo());
    brandingLogo.classList.add('notificare__onboarding-branding-logo');
  }

  const footerButtons = footer.appendChild(document.createElement('div'));
  footerButtons.classList.add('notificare__onboarding-actions');

  const cancelButton = footerButtons.appendChild(
    createDestructiveButton({
      text: autoOnboardingOptions.cancelButton,
      onClick: () => {
        ensureCleanState();
        onCancelClicked();
      },
    }),
  );
  cancelButton.classList.add('notificare__onboarding-cancel-button');

  const acceptButton = footerButtons.appendChild(
    createPrimaryButton({
      text: autoOnboardingOptions.acceptButton,
      onClick: () => {
        ensureCleanState();
        onAcceptClicked();
      },
    }),
  );
  acceptButton.classList.add('notificare__onboarding-accept-button');

  // Add the complete onboarding DOM to the page.
  document.body.appendChild(root);
}

export interface ShowAutoBoardingOptions {
  application: NotificareApplication;
  autoOnboardingOptions: NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions;
  onAcceptClicked: () => void;
  onCancelClicked: () => void;
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push');
  if (root) root.remove();
}
