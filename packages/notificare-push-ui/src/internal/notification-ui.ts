import {
  NotificareApplication,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/core';

export async function createNotificationContainer(
  options: NotificareInternalOptions,
  application: NotificareApplication,
  notification: NotificareNotification,
  closeNotification: () => void,
) {
  const container = document.createElement('div');
  container.id = 'notificare-push-ui';
  container.classList.add('notificare');

  const backdrop = document.createElement('div');
  backdrop.classList.add('notificare__notification-backdrop');
  backdrop.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    closeNotification();
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

  const header = createHeader(options, application, () => closeNotification());
  modal.appendChild(header);

  const attachment = createAttachmentSection(notification);
  if (attachment) modal.appendChild(attachment);

  const content = await createContentSection(options, notification);
  modal.appendChild(content);

  const actions = createActionsSection(notification);
  if (actions) modal.appendChild(actions);

  return container;
}

function createHeader(
  options: NotificareInternalOptions,
  application: NotificareApplication,
  onCloseClicked: () => void,
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
  closeButton.addEventListener('click', onCloseClicked);
  header.appendChild(closeButton);

  return header;
}

function createAttachmentSection(notification: NotificareNotification): HTMLElement | undefined {
  if (notification.type !== 're.notifica.notification.Alert') return undefined;

  const attachment = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (!attachment) return undefined;

  const element = document.createElement('img');
  element.classList.add('notificare__notification-attachment');
  element.setAttribute('src', attachment.uri);

  return element;
}

async function createContentSection(
  options: NotificareInternalOptions,
  notification: NotificareNotification,
): Promise<HTMLElement> {
  const content = document.createElement('div');
  content.classList.add('notificare__notification-content');

  switch (notification.type) {
    case 're.notifica.notification.Alert': {
      const elements = createAlertContent(notification);
      elements.forEach((element) => content.appendChild(element));
      break;
    }
    case 're.notifica.notification.Image': {
      const element = await createImageContent(notification);
      content.appendChild(element);
      break;
    }
    case 're.notifica.notification.Map': {
      const element = await createMapContent(notification);
      content.appendChild(element);
      break;
    }
    case 're.notifica.notification.URL': {
      const element = await createUrlContent(notification);
      content.appendChild(element);
      break;
    }
    case 're.notifica.notification.Video': {
      const element = await createVideoContent(notification);
      content.appendChild(element);
      break;
    }
    case 're.notifica.notification.WebView': {
      const element = await createWebViewContent(notification);
      content.appendChild(element);
      break;
    }
    default:
      throw new Error(`Unsupported notification type: ${notification.type}`);
  }

  return content;
}

function createAlertContent(notification: NotificareNotification): HTMLElement[] {
  const content: HTMLElement[] = [];

  if (notification.title) {
    const title = document.createElement('p');
    title.classList.add('notificare__notification-content-title');
    title.innerHTML = notification.title;
    content.push(title);
  }

  if (notification.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.classList.add('notificare__notification-content-subtitle');
    subtitle.innerHTML = notification.subtitle;
    content.push(subtitle);
  }

  const message = document.createElement('p');
  message.classList.add('notificare__notification-content-message');
  message.innerHTML = notification.message;
  content.push(message);

  return content;
}

async function createImageContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.filter(({ type }) => type === 're.notifica.content.Image');
  if (!content.length) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const slider = document.createElement('div');
  slider.classList.add('notificare__notification-content-slider');

  content.forEach((element) => {
    const item = document.createElement('div');
    item.classList.add('notificare__notification-content-slider-item');
    slider.appendChild(item);

    const image = document.createElement('img');
    image.classList.add('notificare__notification-content-slider-image');
    image.setAttribute('src', element.data);
    item.appendChild(image);
  });

  return slider;
}

async function createMapContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.filter(({ type }) => type === 're.notifica.content.Marker');
  if (!content.length) throw new Error(`Invalid content for notification '${notification.type}'.`);

  if (typeof window.google === 'undefined' || !google || !google.maps) {
    throw new Error('Google Maps library could not be found.');
  }

  const mapContainer = document.createElement('div');
  mapContainer.classList.add('notificare__notification-content-map');

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

  if (markers.length > 1) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => {
      const position = marker.getPosition();
      if (position) bounds.extend(position);
    });

    map.fitBounds(bounds);
  }

  return mapContainer;
}

async function createUrlContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('src', content.data);

  return iframe;
}

async function createVideoContent(notification: NotificareNotification): Promise<HTMLElement> {
  const allowedVideoTypes = [
    're.notifica.content.YouTube',
    're.notifica.content.Vimeo',
    're.notifica.content.HTML5Video',
  ];

  const content = notification.content.find(({ type }) => allowedVideoTypes.includes(type));
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  switch (content.type) {
    case 're.notifica.content.YouTube':
      return createYouTubeContent(content.data);
    case 're.notifica.content.Vimeo':
      return createVimeoContent(content.data);
    case 're.notifica.content.HTML5Video':
      return createHtml5VideoContent(content.data);
    default:
      throw new Error(`Unsupported video type: ${content.type}`);
  }
}

function createYouTubeContent(videoId: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-video-iframe');
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createVimeoContent(videoId: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-video-iframe');
  iframe.setAttribute('src', `https://player.vimeo.com/video/${videoId}?autoplay=1`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createHtml5VideoContent(videoUrl: string): HTMLElement {
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

async function createWebViewContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.HTML');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const html = `<!DOCTYPE html><html><head><title></title><meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"></head><body>${content.data}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('srcdoc', html);

  return iframe;
}

function createActionsSection(notification: NotificareNotification): HTMLElement | undefined {
  if (!notification.actions.length) return undefined;

  const container = document.createElement('div');
  container.classList.add('notificare__notification-actions');

  notification.actions.forEach((action, index) => {
    const actionButton = document.createElement('a');
    actionButton.classList.add('notificare__notification-action-button');
    actionButton.innerHTML = action.label;

    if (index === 0) {
      actionButton.classList.add('notificare__notification-action-button__primary');
    }

    if (action.destructive) {
      actionButton.classList.add('notificare__notification-action-button__destructive');
    }

    container.appendChild(actionButton);
  });

  return container;
}
