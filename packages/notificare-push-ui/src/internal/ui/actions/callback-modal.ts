import {
  getApplication,
  getOptions,
  NotificareApplicationUnavailableError,
  NotificareNotConfiguredError,
} from '@notificare/core';
import {
  createBackdropElement,
  createModalContentElement,
  createModalElement,
  createModalFooterElement,
  createModalHeaderElement,
  createRootElement,
} from '../root-elements';

export async function createCallbackUserInterface(): Promise<HTMLElement> {
  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const application = getApplication();
  if (!application) throw new NotificareApplicationUnavailableError();

  const root = createRootElement();

  // TODO: handle on click
  const backdrop = createBackdropElement(() => {});
  root.appendChild(backdrop);

  const modal = createModalElement();
  modal.classList.add('notificare__notification-action-callback');
  root.appendChild(modal);

  // TODO: handle on click
  const header = createModalHeaderElement(options, application, () => {});
  modal.appendChild(header);

  const video = await createVideoStreamElement();
  video.classList.add('active');

  const canvas = createCanvasCaptureElement();
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) throw new Error(''); // TODO: handle error

  const textArea = document.createElement('textarea');
  textArea.classList.add('notificare-notification-callback-textarea');
  textArea.setAttribute('rows', '3');
  textArea.setAttribute('placeholder', '...');

  const content = createModalContentElement([video, canvas, textArea]);
  modal.appendChild(content);

  const captureButton = document.createElement('a');
  captureButton.classList.add('notificare__notification-action-button');
  captureButton.classList.add('notificare__notification-action-button__primary');
  captureButton.innerHTML = 'Capture';

  captureButton.addEventListener('click', (e) => {
    e.preventDefault();

    canvas.width = video.offsetWidth * window.devicePixelRatio;
    canvas.height = video.offsetHeight * window.devicePixelRatio;
    canvas.style.width = `${video.offsetWidth}px`;
    canvas.style.height = `${video.offsetHeight}px`;

    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

    video.classList.remove('active');
    canvas.classList.add('active');
  });

  const cancelButton = document.createElement('a');
  cancelButton.classList.add('notificare__notification-action-button');
  cancelButton.innerHTML = 'Cancel';
  // TODO: handle on click

  const footer = createModalFooterElement([]);
  modal.appendChild(footer);

  return root;
}

async function createVideoStreamElement(): Promise<HTMLVideoElement> {
  const supported = 'mediaDevices' in navigator;
  if (!supported) throw new Error('WebRTC API unavailable.');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 1280,
      height: 720,
    },
  });

  const video = document.createElement('video');
  video.classList.add('notificare-notification-callback-video');
  video.setAttribute('autoplay', '');
  video.srcObject = stream;
  // video.onloadedmetadata = () => video.play();

  return video;
}

function createCanvasCaptureElement(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.classList.add('notificare-notification-callback-canvas');

  return canvas;
}
