import {
  getOptions,
  NotificareApplication,
  NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
} from '@notificare/core';

export function showOnboarding({
  application,
  autoOnboardingOptions,
  onAcceptClicked,
  onCancelClicked,
}: ShowAutoBoardingOptions) {
  const options = getOptions();
  if (!options) return;

  ensureCleanState();

  const backdrop = document.createElement('div');
  backdrop.id = 'notificare-push-onboarding';
  backdrop.classList.add('notificare', 'notificare__onboarding-backdrop');

  const modal = document.createElement('div');
  modal.classList.add('notificare__onboarding-modal');
  backdrop.appendChild(modal);

  const content = document.createElement('div');
  content.classList.add('notificare__onboarding-content');
  modal.appendChild(content);

  const icon = document.createElement('img');
  icon.classList.add('notificare__onboarding-icon');

  if (application.websitePushConfig?.icon) {
    icon.setAttribute(
      'src',
      `${options.services.awsStorageHost}${application.websitePushConfig.icon}`,
    );
  }

  content.appendChild(icon);

  const textContent = document.createElement('div');
  textContent.classList.add('notificare__onboarding-text-content');
  content.appendChild(textContent);

  const title = document.createElement('p');
  title.classList.add('notificare__onboarding-title');
  title.innerHTML = application.name;
  textContent.appendChild(title);

  const text = document.createElement('p');
  text.classList.add('notificare__onboarding-text');
  text.innerHTML = autoOnboardingOptions.message;
  textContent.appendChild(text);

  const footer = document.createElement('div');
  footer.classList.add('notificare__onboarding-footer');
  modal.appendChild(footer);

  if (application.branding) {
    const brandingContainer = document.createElement('a');
    brandingContainer.classList.add('notificare__onboarding-branding-content');
    brandingContainer.setAttribute('href', 'https://notificare.com');
    brandingContainer.setAttribute('target', '_blank');
    footer.appendChild(brandingContainer);

    const brandingText = document.createElement('p');
    brandingText.classList.add('notificare__onboarding-branding');
    brandingText.innerHTML = 'powered by';
    brandingContainer.appendChild(brandingText);

    const brandingLogo = document.createElement('a');
    brandingLogo.classList.add('notificare__onboarding-branding-logo');
    brandingLogo.innerHTML = NotificareLogo;
    brandingContainer.appendChild(brandingLogo);
  }

  const footerButtons = document.createElement('div');
  footerButtons.classList.add('notificare__onboarding-actions');
  footer.appendChild(footerButtons);

  const cancelButton = document.createElement('a');
  cancelButton.classList.add('notificare__onboarding-cancel-button');
  cancelButton.innerHTML = autoOnboardingOptions.cancelButton;
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    ensureCleanState();
    onCancelClicked();
  });
  footerButtons.appendChild(cancelButton);

  const acceptButton = document.createElement('a');
  acceptButton.classList.add('notificare__onboarding-accept-button');
  acceptButton.innerHTML = autoOnboardingOptions.acceptButton;
  acceptButton.addEventListener('click', (e) => {
    e.preventDefault();
    ensureCleanState();
    onAcceptClicked();
  });
  footerButtons.appendChild(acceptButton);

  // Add the complete onboarding DOM to the page.
  document.body.appendChild(backdrop);
}

export interface ShowAutoBoardingOptions {
  application: NotificareApplication;
  autoOnboardingOptions: NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions;
  onAcceptClicked: () => void;
  onCancelClicked: () => void;
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push-onboarding');
  if (root) root.remove();
}

const NotificareLogo =
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="16"><g fill="none" fill-rule="nonzero"><path fill="#000" d="M24.34 9.811h1.894V5.76c.336-.257.798-.502 1.284-.502.261 0 .486.073.648.257.15.171.212.392.212.845V9.81h1.894V6.052c0-.869-.162-1.395-.536-1.787-.386-.392-.96-.612-1.608-.612-.772 0-1.42.318-1.894.698l-.025-.012v-.551h-1.87V9.81ZM33.326 6.8c0-.857.66-1.542 1.52-1.542s1.52.685 1.52 1.542-.66 1.543-1.52 1.543-1.52-.686-1.52-1.542Zm-1.895 0c0 1.776 1.458 3.147 3.415 3.147s3.415-1.371 3.415-3.147c0-1.775-1.458-3.146-3.415-3.146S31.431 5.024 31.431 6.8Zm9.01 2.547c.387.404.973.6 1.596.6.536 0 1.097-.147 1.384-.33V8.133c-.25.122-.599.245-.91.245-.573 0-.71-.44-.71-1.029V5.33h1.62V3.789H41.8V1.902l-1.895.319v1.567h-.997V5.33h.997v2.216c0 .955.212 1.457.536 1.8Zm3.964-7.468c0 .588.499 1.065 1.097 1.065s1.097-.477 1.097-1.065S46.1.813 45.502.813s-1.097.477-1.097 1.065Zm.15 7.933h1.894V3.788h-1.894V9.81Zm3.8 0h1.895v-4.48h1.421V3.788h-1.42V2.772c0-.514.124-.882.71-.882.212 0 .586.05.823.11V.495a3.085 3.085 0 0 0-1.048-.17c-.61 0-1.296.146-1.732.562-.474.441-.648 1.163-.648 2.008v.894h-.872V5.33h.872v4.481Zm4.201-7.933c0 .588.499 1.065 1.097 1.065s1.097-.477 1.097-1.065S54.25.813 53.653.813s-1.097.477-1.097 1.065Zm.15 7.933H54.6V3.788h-1.894V9.81Zm3.09-3c0 1.813 1.446 3.135 3.416 3.135.698 0 1.42-.147 2.006-.465V7.767c-.51.38-1.196.6-1.795.6-1.022 0-1.732-.65-1.732-1.567 0-.906.698-1.58 1.708-1.58.585 0 1.183.22 1.732.563V4.057a4.187 4.187 0 0 0-1.82-.404c-1.92 0-3.514 1.261-3.514 3.159Zm8.5 3.135c.698 0 1.31-.22 1.708-.502h.025c.336.343.822.477 1.32.477.362 0 .699-.073.91-.183V8.342a.725.725 0 0 1-.31.074c-.263 0-.375-.196-.375-.478V5.894c0-.76-.224-1.298-.685-1.665-.486-.392-1.222-.576-2.044-.576-.898 0-1.645.22-2.144.466v1.603c.486-.257 1.11-.477 1.795-.477.449 0 .773.098.947.257.137.122.237.343.237.637v.232a5.013 5.013 0 0 0-1.06-.11c-.635 0-1.246.11-1.72.429-.436.293-.747.795-.747 1.456 0 .625.274 1.102.723 1.408.398.27.897.392 1.42.392Zm.524-1.371c-.436 0-.785-.208-.785-.6 0-.465.486-.612.972-.612.2 0 .473.024.673.086v.881a1.723 1.723 0 0 1-.86.245Zm4.424 1.236h1.895V6.163c.448-.514.997-.71 1.657-.71.175 0 .362.024.511.061v-1.75a1.548 1.548 0 0 0-.399-.05c-.76 0-1.358.306-1.782.894l-.025-.012v-.808h-1.857V9.81ZM79.963 7.29c.025-.159.037-.428.037-.636 0-2.02-1.42-3-2.929-3-1.695 0-3.215 1.249-3.215 3.171 0 1.885 1.458 3.122 3.477 3.122.81 0 1.732-.184 2.33-.551V7.84c-.648.429-1.395.661-2.08.661-.873 0-1.571-.38-1.783-1.212h4.163Zm-2.917-2.216c.61 0 1.097.392 1.21 1.041h-2.469c.163-.685.674-1.04 1.26-1.04Z"/><path fill="#10D1C4" d="M12.076 12.399a6.05 6.05 0 0 0 1.568-.206L10.848 9.38l3.616 3.637a1.523 1.523 0 0 1 0 2.145 1.5 1.5 0 0 1-2.131 0l-2.747-2.764h2.49Z"/><path fill="#000" d="m10.848 9.38 2.796 2.813a6.045 6.045 0 0 1-1.568.206h-2.49l-2.85-2.866a1.535 1.535 0 0 1-.132-.153h4.244Z"/><path fill="#10D1C4" d="m10.848 9.38 2.796 2.813a6.045 6.045 0 0 1-1.568.206h-2.49l-2.85-2.866a1.535 1.535 0 0 1-.132-.153h4.244Z" opacity=".6"/><path fill="#000" d="m12.184 12.398.058-.002.052-.001-.052.001c.036 0 .072-.002.108-.004l-.056.003.131-.006-.075.003.109-.005-.034.002.128-.009-.095.006c.075-.004.149-.01.223-.017l-.087.008.124-.012-.037.004.115-.013-.077.009.118-.014-.041.005c.035-.004.07-.008.106-.014l-.065.009.114-.015-.049.006c.107-.014.213-.032.319-.052l-.06.011.097-.018-.037.007.1-.02-.063.013.131-.028-.068.015.098-.021-.03.006.115-.026-.086.02a5.98 5.98 0 0 0 .226-.056L10.848 9.38H6.604c.04.053.085.104.133.153l2.849 2.866H6.038a6.038 6.038 0 0 1 0-12.076h6.038a6.038 6.038 0 0 1 1.568 11.87l-.015.004-.063.016.078-.02a5.993 5.993 0 0 1-1.46.205Zm-.108-9.056H6.038a3.02 3.02 0 0 0-.06 6.037h6.098a3.02 3.02 0 0 0 0-6.037Z"/></g></svg>';