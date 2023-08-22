import {
  createBackdrop,
  createModal,
  createModalContent,
  createModalFooter,
  createModalHeader,
  createPrimaryButton,
  createRoot,
  createSecondaryButton,
} from '@notificare/web-ui';
import { ROOT_ELEMENT_IDENTIFIER } from '../root';
import { getApplicationIcon, getApplicationName } from '../../utils';
import { logger } from '../../../logger';

export function createCameraCallbackModal({
  hasMoreSteps,
  onMediaCaptured,
  dismiss,
}: CreateCameraCallbackParams): HTMLElement {
  const root = createRoot(ROOT_ELEMENT_IDENTIFIER);

  root.appendChild(createBackdrop(() => dismiss()));

  const modal = root.appendChild(createModal());
  modal.classList.add('notificare__camera-callback');

  modal.appendChild(
    createModalHeader({
      icon: getApplicationIcon(),
      title: getApplicationName(),
      onCloseButtonClicked: () => dismiss(),
    }),
  );

  const content = modal.appendChild(createModalContent());

  const video = content.appendChild(document.createElement('video'));
  video.classList.add('notificare__camera-callback-video');
  video.setAttribute('autoplay', '');

  createVideoStream()
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => logger.error('Unable to acquire a video stream.', error));

  const canvas = document.createElement('canvas');
  canvas.classList.add('notificare__camera-callback-canvas');

  const footer = modal.appendChild(createModalFooter());
  footer.classList.add('notificare__modal-footer__callback');

  const takePictureButton = footer.appendChild(
    createPrimaryButton({
      text: 'Take picture',
      onClick: () => {
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
          logger.warning('The Canvas API is not available.');
          return;
        }

        // Draw the video stream onto the canvas.
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the video stream.
        const stream = video.srcObject as MediaStream | null;
        stream?.getTracks()?.forEach((track) => track.stop());
        video.srcObject = null;

        content.removeChild(video);
        content.appendChild(canvas);

        footer.removeChild(takePictureButton);
        footer.appendChild(retakePictureButton);
        footer.appendChild(sendButton);
      },
    }),
  );

  const retakePictureButton = createSecondaryButton({
    text: 'Retake picture',
    onClick: () => {
      content.removeChild(canvas);
      content.appendChild(video);

      createVideoStream()
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((error) => logger.error('Unable to acquire a video stream.', error));

      footer.removeChild(retakePictureButton);
      footer.removeChild(sendButton);
      footer.appendChild(takePictureButton);
    },
  });

  const sendButton = createPrimaryButton({
    text: hasMoreSteps ? 'Continue' : 'Send',
    onClick: () => {
      canvas.toBlob((blob) => {
        if (!blob) {
          logger.warning('Unable to create a blob to upload.');
          return;
        }

        onMediaCaptured(blob, 'image/jpg');
      }, 'image/jpg');
    },
  });

  return root;
}

async function createVideoStream(): Promise<MediaStream> {
  const supported = 'mediaDevices' in navigator;
  if (!supported) throw new Error('WebRTC API unavailable.');

  return navigator.mediaDevices.getUserMedia({
    video: {
      width: 1280,
      height: 720,
    },
  });
}

interface CreateCameraCallbackParams {
  hasMoreSteps: boolean;
  onMediaCaptured: (blob: Blob, mimeType: string) => void;
  dismiss: () => void;
}
