import {
  NotificareApplication,
  NotificareInternalOptions,
  NotificareNotification,
  NotificareNotificationAction,
} from '@notificare/core';
import {
  createBackdropElement,
  createModalContentElement,
  createModalElement,
  createModalFooterElement,
  createModalHeaderElement,
  createRootElement,
} from './ui/root-elements';

export async function createNotificationContainer(
  options: NotificareInternalOptions,
  application: NotificareApplication,
  notification: NotificareNotification,
  closeNotification: () => void,
  presentAction: (action: NotificareNotificationAction) => void,
) {
  const container = createRootElement();

  const backdrop = createBackdropElement(() => closeNotification());
  container.appendChild(backdrop);

  const modal = createModalElement();
  modal.classList.add('notificare__notification');
  modal.setAttribute('data-notification-type', notification.type);
  container.appendChild(modal);

  const header = createModalHeaderElement(options, application, () => closeNotification());
  modal.appendChild(header);

  const content = await createContentSection(options, notification);
  modal.appendChild(content);

  const actions = createActionsSection(notification, (action) => presentAction(action));
  if (actions) modal.appendChild(actions);

  return container;
}

async function createContentSection(
  options: NotificareInternalOptions,
  notification: NotificareNotification,
): Promise<HTMLElement> {
  let children: HTMLElement[];

  switch (notification.type) {
    case 're.notifica.notification.Alert': {
      children = createAlertContent(notification);
      break;
    }
    case 're.notifica.notification.Image': {
      children = await createImageContent(notification);
      break;
    }
    case 're.notifica.notification.Map': {
      children = await createMapContent(notification);
      break;
    }
    case 're.notifica.notification.URL': {
      children = await createUrlContent(notification);
      break;
    }
    case 're.notifica.notification.Video': {
      children = await createVideoContent(notification);
      break;
    }
    case 're.notifica.notification.WebView': {
      children = await createWebViewContent(notification);
      break;
    }
    default:
      throw new Error(`Unsupported notification type: ${notification.type}`);
  }

  return createModalContentElement(children);
}

function createAlertContent(notification: NotificareNotification): HTMLElement[] {
  const content: HTMLElement[] = [];

  const attachment = createAttachmentSection(notification);
  if (attachment) content.push(attachment);

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

function createAttachmentSection(notification: NotificareNotification): HTMLElement | undefined {
  const attachment = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (!attachment) return undefined;

  const element = document.createElement('img');
  element.classList.add('notificare__notification-attachment');
  element.setAttribute('src', attachment.uri);

  return element;
}

async function createImageContent(notification: NotificareNotification): Promise<HTMLElement[]> {
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

  return [slider];
}

async function createMapContent(notification: NotificareNotification): Promise<HTMLElement[]> {
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

  return [mapContainer];
}

async function createUrlContent(notification: NotificareNotification): Promise<HTMLElement[]> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('src', content.data);

  return [iframe];
}

async function createVideoContent(notification: NotificareNotification): Promise<HTMLElement[]> {
  const allowedVideoTypes = [
    're.notifica.content.YouTube',
    're.notifica.content.Vimeo',
    're.notifica.content.HTML5Video',
  ];

  const content = notification.content.find(({ type }) => allowedVideoTypes.includes(type));
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  switch (content.type) {
    case 're.notifica.content.YouTube':
      return [createYouTubeContent(content.data)];
    case 're.notifica.content.Vimeo':
      return [createVimeoContent(content.data)];
    case 're.notifica.content.HTML5Video':
      return [createHtml5VideoContent(content.data)];
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

async function createWebViewContent(notification: NotificareNotification): Promise<HTMLElement[]> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.HTML');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const html = `<!DOCTYPE html><html><head><title></title><meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"></head><body>${content.data}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('srcdoc', html);

  return [iframe];
}

function createActionsSection(
  notification: NotificareNotification,
  onActionClicked: (action: NotificareNotificationAction) => void,
): HTMLElement | undefined {
  if (!notification.actions.length) return undefined;

  const buttons = notification.actions.map((action, index) => {
    const button = document.createElement('a');
    button.classList.add('notificare__notification-action-button');
    button.innerHTML = action.label;

    if (index === 0) {
      button.classList.add('notificare__notification-action-button__primary');
    }

    if (action.destructive) {
      button.classList.add('notificare__notification-action-button__destructive');
    }

    button.addEventListener('click', () => {
      onActionClicked(action);
    });

    return button;
  });

  return createModalFooterElement(buttons);
}
