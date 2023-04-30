import {
  getApplication,
  getOptions,
  NotificareApplication,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/core';
import { logger } from './logger';

export function presentNotification(notification: NotificareNotification) {
  ensureCleanState();

  const application = getApplication();
  if (!application) {
    logger.warning('Unable to present the notification. The cached application is unavailable.');
    return;
  }

  const options = getOptions();
  if (!options) {
    logger.warning('Unable to present the notification. Notificare is not configured.');
    return;
  }

  if (!checkNotificationSupport(notification)) {
    logger.warning(
      `Unable to present the notification. Unsupported notification type '${notification.type}'.`,
    );
    return;
  }

  switch (notification.type) {
    case 're.notifica.notification.None':
      logger.debug(
        "Attempting to present a notification of type 'none'. These should be handled by the application instead.",
      );
      return;

    case 're.notifica.notification.InAppBrowser':
      presentInAppBrowser(notification);
      return;

    case 're.notifica.notification.URLScheme':
      presentUrlScheme(notification);
      return;

    case 're.notifica.notification.Passbook':
      presentPassbook(options, notification);
      return;

    default:
      break;
  }

  const container = document.createElement('div');
  container.id = 'notificare-push-ui';
  container.classList.add('notificare');

  const backdrop = document.createElement('div');
  backdrop.classList.add('notificare__notification-backdrop');
  backdrop.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    dismissNotificationUI();
  });
  container.appendChild(backdrop);

  const modal = document.createElement('div');
  modal.classList.add('notificare__notification');
  modal.setAttribute('data-notification-type', notification.type);
  modal.addEventListener('click', (e) => {
    // Prevent the backdrop click to dismiss from receiving events when
    // the notification content is clicked.
    e.preventDefault();
  });
  container.appendChild(modal);

  const header = createHeader(options, application);
  modal.appendChild(header);

  const attachmentImage = createAttachmentElement(notification);
  if (attachmentImage) modal.appendChild(attachmentImage);

  const content = createContentElement(options, notification);
  modal.appendChild(content);

  if (notification.actions.length) {
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('notificare__notification-actions');
    modal.appendChild(actionsContainer);

    notification.actions.forEach((action) => {
      const actionButton = document.createElement('a');
      actionButton.classList.add('notificare__notification-action-button');
      actionButton.innerHTML = action.label;

      if (action.destructive) {
        actionButton.classList.add('notificare__notification-action-button__destructive');
      }

      actionsContainer.appendChild(actionButton);
    });
  }

  // Add the complete notification DOM to the page.
  document.body.appendChild(container);
}

function presentInAppBrowser(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  window.open(content.data);
}

function presentPassbook(options: NotificareInternalOptions, notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.PKPass');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const passUrlStr: string = content.data;
  const components = passUrlStr.split('/');
  if (!components.length) {
    // TODO: this should fail to present the notification.
    return;
  }

  const id = components[components.length - 1];
  const url = `${options.services.pushHost}/pass/web/${id}?showWebVersion=1`;

  window.open(url);
}

function presentUrlScheme(notification: NotificareNotification) {
  if (notification.type !== 're.notifica.notification.URLScheme') return;

  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    logger.warning('Unable to present the notification. No URL content available.');
    return;
  }

  window.location.href = content.data;
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push-ui');
  if (root) root.remove();
}

function dismissNotificationUI() {
  ensureCleanState();
}

function checkNotificationSupport(notification: NotificareNotification): boolean {
  switch (notification.type) {
    case 're.notifica.notification.None':
    case 're.notifica.notification.Alert':
    case 're.notifica.notification.Image':
    case 're.notifica.notification.InAppBrowser':
    case 're.notifica.notification.Map':
    case 're.notifica.notification.Passbook':
    case 're.notifica.notification.URL':
    case 're.notifica.notification.URLScheme':
    case 're.notifica.notification.Video':
    case 're.notifica.notification.WebView':
      return true;
    default:
      return false;
  }
}

function createHeader(
  options: NotificareInternalOptions,
  application: NotificareApplication,
): HTMLElement {
  const header = document.createElement('div');
  header.classList.add('notificare__notification-header');

  const headerLogo = document.createElement('img');
  headerLogo.classList.add('notificare__notification-header-logo');

  if (application.websitePushConfig?.icon) {
    headerLogo.setAttribute(
      'src',
      `${options.services.awsStorageHost}${application.websitePushConfig.icon}`,
    );
  }

  header.appendChild(headerLogo);

  const headerTitle = document.createElement('p');
  headerTitle.classList.add('notificare__notification-header-title');
  headerTitle.innerHTML = application.name;
  header.appendChild(headerTitle);

  const headerCloseButton = document.createElement('div');
  headerCloseButton.classList.add('notificare__notification-header-close-button');
  headerCloseButton.addEventListener('click', dismissNotificationUI);
  header.appendChild(headerCloseButton);

  return header;
}

function createAttachmentElement(notification: NotificareNotification): HTMLElement | undefined {
  if (notification.type !== 're.notifica.notification.Alert') return undefined;

  const attachment = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (!attachment) return undefined;

  const element = document.createElement('img');
  element.classList.add('notificare__notification-attachment');
  element.setAttribute('src', attachment.uri);

  return element;
}

function createContentElement(
  options: NotificareInternalOptions,
  notification: NotificareNotification,
): HTMLElement {
  const content = document.createElement('div');
  content.classList.add('notificare__notification-content');

  switch (notification.type) {
    case 're.notifica.notification.Alert':
      populateContentWithAlert(notification, content);
      break;

    case 're.notifica.notification.Image':
      populateContentWithImage(notification, content);
      break;

    case 're.notifica.notification.Map':
      populateContentWithMap(notification, content);
      break;

    case 're.notifica.notification.URL':
      populateContentWithUrl(notification, content);
      break;

    case 're.notifica.notification.Video':
      populateContentWithVideo(notification, content);
      break;

    case 're.notifica.notification.WebView':
      populateContentWithWebView(notification, content);
      break;

    default:
      logger.warning(`Unsupported notification type: ${notification.type}`);
  }

  return content;
}

function populateContentWithAlert(notification: NotificareNotification, container: HTMLElement) {
  if (notification.title) {
    const contentTitle = document.createElement('p');
    contentTitle.classList.add('notificare__notification-content-title');
    contentTitle.innerHTML = notification.title;
    container.appendChild(contentTitle);
  }

  if (notification.subtitle) {
    const contentSubtitle = document.createElement('p');
    contentSubtitle.classList.add('notificare__notification-content-subtitle');
    contentSubtitle.innerHTML = notification.subtitle;
    container.appendChild(contentSubtitle);
  }

  const contentMessage = document.createElement('p');
  contentMessage.classList.add('notificare__notification-content-message');
  contentMessage.innerHTML = notification.message;
  container.appendChild(contentMessage);
}

function populateContentWithImage(notification: NotificareNotification, container: HTMLElement) {
  const content = notification.content.filter(({ type }) => type === 're.notifica.content.Image');
  if (!content.length) {
    // TODO: this should fail to present the notification.
    return;
  }

  const slider = document.createElement('div');
  slider.classList.add('notificare__notification-content-slider');
  container.appendChild(slider);

  content.forEach((element) => {
    const item = document.createElement('div');
    item.classList.add('notificare__notification-content-slider-item');
    slider.appendChild(item);

    const image = document.createElement('img');
    image.classList.add('notificare__notification-content-slider-image');
    image.setAttribute('src', element.data);
    item.appendChild(image);
  });
}

async function populateContentWithMap(
  notification: NotificareNotification,
  container: HTMLElement,
) {
  const content = notification.content.filter(({ type }) => type === 're.notifica.content.Marker');
  if (!content.length) {
    // TODO: this should fail to present the notification.
    return;
  }

  if (typeof window.google === 'undefined' || !window.google || !window.google.maps) {
    // TODO: this should fail to present the notification.
    return;
  }

  const mapContainer = document.createElement('div');
  mapContainer.classList.add('notificare__notification-content-map');
  container.appendChild(mapContainer);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { Map } = await google.maps.importLibrary('maps');

  const map = new Map(mapContainer, {
    zoom: 15,
    center: {
      lat: content[0].data.latitude,
      lng: content[0].data.longitude,
    },
  });

  const markers = content.map(({ data }) => {
    const marker = new google.maps.Marker({
      map,
      position: {
        lat: data.latitude,
        lng: data.longitude,
      },
    });

    if (data.title || data.description) {
      const infoWindowContent = document.createElement('div');
      infoWindowContent.classList.add('notificare__notification-content-map-info-window');

      if (data.title) {
        const title = document.createElement('h2');
        title.classList.add('notificare__notification-content-map-info-window-title');
        title.innerHTML = data.title;
        infoWindowContent.appendChild(title);
      }

      if (data.description) {
        const description = document.createElement('p');
        description.classList.add('notificare__notification-content-map-info-window-description');
        description.innerHTML = data.description;
        infoWindowContent.appendChild(description);
      }

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        ariaLabel: 'Uluru',
      });

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map,
        });
      });
    }

    return marker;
  });

  if (content.length > 1) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => {
      const position = marker.getPosition();
      if (position) bounds.extend(position);
    });

    map.fitBounds(bounds);
  }
}

function populateContentWithUrl(notification: NotificareNotification, container: HTMLElement) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('src', content.data);
  container.appendChild(iframe);
}

function populateContentWithVideo(notification: NotificareNotification, container: HTMLElement) {
  if (!notification.content.length) {
    // TODO: this should fail to present the notification.
    return;
  }

  const content = notification.content[0];
  let element: HTMLElement | undefined;

  if (content.type === 're.notifica.content.YouTube') {
    element = createYouTubeElement(content.data);
  } else if (content.type === 're.notifica.content.Vimeo') {
    element = createVimeoElement(content.data);
  } else if (content.type === 're.notifica.content.HTML5Video') {
    element = createHtml5VideoElement(content.data);
  } else {
    // TODO: this should fail to present the notification.
    return;
  }

  container.appendChild(element);
}

function createYouTubeElement(videoId: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-video-iframe');
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createVimeoElement(videoId: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-video-iframe');
  iframe.setAttribute('src', `https://player.vimeo.com/video/${videoId}?autoplay=1`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createHtml5VideoElement(videoUrl: string): HTMLElement {
  const video = document.createElement('video');
  video.classList.add('notificare__notification-content-video');
  video.setAttribute('autoplay', '');
  video.setAttribute('controls', '');
  video.setAttribute('preload', '');

  const source = document.createElement('source');
  source.setAttribute('src', videoUrl);
  source.setAttribute('type', 'video/mp4');
  video.appendChild(source);

  return video;
}

function populateContentWithWebView(notification: NotificareNotification, container: HTMLElement) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.HTML');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const html = `<!DOCTYPE html><html><head><title></title><meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"></head><body>${content.data}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('srcdoc', html);
  container.appendChild(iframe);
}