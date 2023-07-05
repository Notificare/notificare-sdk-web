import { NotificareNotification } from '@notificare/core';

export async function createVideoContent(
  notification: NotificareNotification,
): Promise<HTMLElement> {
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
  iframe.classList.add('notificare__notification-video-iframe');
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createVimeoContent(videoId: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-video-iframe');
  iframe.setAttribute('src', `https://player.vimeo.com/video/${videoId}?autoplay=1`);
  iframe.setAttribute('allowfullscreen', '');

  return iframe;
}

function createHtml5VideoContent(videoUrl: string): HTMLElement {
  const video = document.createElement('video');
  video.classList.add('notificare__notification-video');
  video.setAttribute('autoplay', '');
  video.setAttribute('controls', '');
  video.setAttribute('preload', '');

  const source = document.createElement('source');
  source.setAttribute('src', videoUrl);
  source.setAttribute('type', 'video/mp4');
  video.appendChild(source);

  return video;
}
