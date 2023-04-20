import {
  NotificareWebsitePushConfigLaunchConfigFloatingButtonHorizontalAlignment,
  NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
  NotificareWebsitePushConfigLaunchConfigFloatingButtonVerticalAlignment,
} from '@notificare/core';
import { getPushPermissionStatus } from '../utils/push';

let permissionCheckTimer: number | undefined;

export function showFloatingButton({
  options: floatingButtonOptions,
  onButtonClicked,
}: ShowFloatingButtonOptions) {
  ensureCleanState();

  const floatingButton = document.createElement('div');
  floatingButton.id = 'notificare-push-floating-button';
  floatingButton.setAttribute('data-permission-status', getPushPermissionStatus());
  floatingButton.classList.add(
    'notificare',
    'notificare__floating-button',
    FloatingButtonHorizontalAlignmentCssClasses[floatingButtonOptions.alignment.horizontal],
    FloatingButtonVerticalAlignmentCssClasses[floatingButtonOptions.alignment.vertical],
  );

  const iconContainer = document.createElement('a');
  iconContainer.classList.add('notificare__floating-button-icon');
  iconContainer.innerHTML = getCurrentBellIcon();
  floatingButton.appendChild(iconContainer);

  const tooltip = document.createElement('span');
  tooltip.classList.add('notificare__floating-button-tooltip');
  tooltip.innerHTML = getCurrentTooltipText(floatingButtonOptions);
  floatingButton.appendChild(tooltip);

  floatingButton.addEventListener('click', (e) => {
    e.preventDefault();
    onButtonClicked();
  });

  permissionCheckTimer = window.setInterval(
    () => onPermissionStatusChanged(floatingButtonOptions),
    2000,
  );

  // Add the complete onboarding DOM to the page.
  document.body.appendChild(floatingButton);
}

export interface ShowFloatingButtonOptions {
  options: NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions;
  onButtonClicked: () => void;
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push-floating-button');
  if (root) root.remove();

  const timer = permissionCheckTimer;
  if (timer) window.clearInterval(timer);
  permissionCheckTimer = undefined;
}

function getCurrentBellIcon(): string {
  const status = getPushPermissionStatus();

  switch (status) {
    case 'default':
      return BellSvg;
    case 'granted':
      return BellGrantedBadgeSvg;
    case 'denied':
      return BellDeniedBadgeSvg;
    default:
      return BellSvg;
  }
}

function getCurrentTooltipText({
  permissionTexts,
}: NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions): string {
  const status = getPushPermissionStatus();

  switch (status) {
    case 'default':
      return permissionTexts.default;
    case 'granted':
      return permissionTexts.granted;
    case 'denied':
      return permissionTexts.denied;
    default:
      return permissionTexts.default;
  }
}

function onPermissionStatusChanged(
  options: NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
) {
  const floatingButton = document.getElementById('notificare-push-floating-button');
  if (!floatingButton) return;

  const currentStatus = floatingButton.getAttribute('data-permission-status');
  const status = getPushPermissionStatus();

  if (status === currentStatus) return;

  const iconElements = floatingButton.getElementsByClassName('notificare__floating-button-icon');
  for (let i = 0; i < iconElements.length; i += 1) {
    const element = iconElements.item(i);
    if (element) element.innerHTML = getCurrentBellIcon();
  }

  const tooltipElements = floatingButton.getElementsByClassName(
    'notificare__floating-button-tooltip',
  );
  for (let i = 0; i < tooltipElements.length; i += 1) {
    const element = tooltipElements.item(i);
    if (element) element.innerHTML = getCurrentTooltipText(options);
  }

  floatingButton.setAttribute('data-permission-status', status);
}

const FloatingButtonHorizontalAlignmentCssClasses: Record<
  NotificareWebsitePushConfigLaunchConfigFloatingButtonHorizontalAlignment,
  string
> = {
  start: 'notificare__floating-button__start',
  center: 'notificare__floating-button__horizontal-center',
  end: 'notificare__floating-button__end',
};

const FloatingButtonVerticalAlignmentCssClasses: Record<
  NotificareWebsitePushConfigLaunchConfigFloatingButtonVerticalAlignment,
  string
> = {
  top: 'notificare__floating-button__top',
  center: 'notificare__floating-vertical-center',
  bottom: 'notificare__floating-button__bottom',
};

const BellSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#000" fill-rule="nonzero" d="M1 18.39c0 .847.65 1.405 1.754 1.405h4.902C7.75 22.037 9.503 24 11.955 24c2.462 0 4.216-1.952 4.31-4.205h4.902c1.091 0 1.754-.558 1.754-1.406 0-1.161-1.185-2.207-2.184-3.24-.767-.802-.976-2.452-1.069-3.788-.081-4.577-1.266-7.527-4.356-8.643C14.917 1.197 13.674 0 11.955 0c-1.708 0-2.963 1.197-3.346 2.718-3.09 1.116-4.275 4.066-4.356 8.643-.093 1.336-.302 2.986-1.07 3.787C2.174 16.182 1 17.228 1 18.39Zm2.254-.35v-.139c.209-.337.906-1.022 1.51-1.696.836-.929 1.231-2.428 1.336-4.693.093-5.076 1.603-6.691 3.59-7.237.29-.07.452-.21.464-.511.035-1.208.732-2.056 1.8-2.056 1.08 0 1.766.848 1.813 2.056.011.302.162.441.453.51 1.998.547 3.508 2.162 3.601 7.238.104 2.265.5 3.764 1.324 4.693.616.674 1.301 1.36 1.51 1.696v.14H3.254Zm6.215 1.755h4.983c-.093 1.58-1.092 2.567-2.497 2.567-1.394 0-2.405-.987-2.486-2.567Z"/></svg>';

const BellGrantedBadgeSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="#000" fill-rule="evenodd"><path fill-rule="nonzero" d="M11.955 0c.345 0 .672.048.976.138a7.772 7.772 0 0 0-1.42 1.624c-.815.202-1.327.97-1.357 2.002-.012.302-.174.441-.465.51-1.986.547-3.496 2.162-3.59 7.238-.104 2.265-.499 3.764-1.335 4.693-.604.674-1.301 1.36-1.51 1.696v.14h17.401v-.14c-.209-.337-.894-1.022-1.51-1.696-.515-.58-.862-1.382-1.076-2.455H18c.677 0 1.334-.087 1.96-.25.16.661.402 1.256.777 1.648.999 1.034 2.184 2.08 2.184 3.241 0 .848-.663 1.406-1.754 1.406h-4.903C16.171 22.048 14.417 24 11.954 24c-2.45 0-4.205-1.963-4.298-4.205H2.754C1.651 19.795 1 19.237 1 18.389c0-1.161 1.173-2.207 2.184-3.24.767-.802.976-2.452 1.069-3.788.081-4.577 1.266-7.527 4.356-8.643C8.992 1.197 10.247 0 11.955 0Zm2.497 19.795H9.47c.08 1.58 1.092 2.567 2.486 2.567 1.405 0 2.404-.987 2.497-2.567Z"/><path d="M18 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm2.683 3c-.14 0-.216.046-.3.18l-3.126 5.023-1.623-2.142c-.087-.122-.174-.172-.3-.172-.198 0-.334.137-.334.33 0 .081.035.172.101.257l1.807 2.32c.105.137.213.204.362.204.15 0 .269-.067.352-.197l3.29-5.224A.479.479 0 0 0 21 3.32c0-.193-.125-.319-.317-.319Z"/></g></svg>';

const BellDeniedBadgeSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="#000" fill-rule="evenodd"><path fill-rule="nonzero" d="M11.955 0c.345 0 .672.048.976.138a7.772 7.772 0 0 0-1.42 1.624c-.815.202-1.327.97-1.357 2.002-.012.302-.174.441-.465.51-1.986.547-3.496 2.162-3.59 7.238-.104 2.265-.499 3.764-1.335 4.693-.604.674-1.301 1.36-1.51 1.696v.14h17.401v-.14c-.209-.337-.894-1.022-1.51-1.696-.515-.58-.862-1.382-1.076-2.455H18c.677 0 1.334-.087 1.96-.25.16.661.402 1.256.777 1.648.999 1.034 2.184 2.08 2.184 3.241 0 .848-.663 1.406-1.754 1.406h-4.903C16.171 22.048 14.417 24 11.954 24c-2.45 0-4.205-1.963-4.298-4.205H2.754C1.651 19.795 1 19.237 1 18.389c0-1.161 1.173-2.207 2.184-3.24.767-.802.976-2.452 1.069-3.788.081-4.577 1.266-7.527 4.356-8.643C8.992 1.197 10.247 0 11.955 0Zm2.497 19.795H9.47c.08 1.58 1.092 2.567 2.486 2.567 1.405 0 2.404-.987 2.497-2.567Z"/><path d="M18 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm2.312 3.117L17.998 5.43 15.69 3.117a.41.41 0 0 0-.572 0 .41.41 0 0 0 0 .572L17.43 6l-2.313 2.313a.41.41 0 0 0 0 .572.41.41 0 0 0 .572 0L18 6.571l2.313 2.313a.404.404 0 0 0 .568-.572L18.57 5.998 20.88 3.69a.404.404 0 0 0-.568-.573Z"/></g></svg>';
