import { logApplicationClose, logApplicationOpen } from './internal-api-events';
import { getSession, StoredSession, storeSession } from './internal-api-session-shared';
import { isReady } from './launch-state';
import { logger } from './logger';
import { getOptions } from './options';
import { getStoredDevice } from './storage/local-storage';
import { randomUUID } from './utils';

const TEN_MINUTES_MILLISECONDS = 600000;

let sessionCloseTimeout: number | undefined;

export async function launch() {
  const currentSession = getSession();

  if (!currentSession) {
    await startSession();
    return;
  }

  const unloadTimestampStr = localStorage.getItem('re.notifica.unload_timestamp');
  if (!unloadTimestampStr) {
    logger.debug('Resuming previous session (no unload timestamp).');
    return;
  }

  const unloadTimestamp = parseInt(unloadTimestampStr, 10);
  const tenSecondsAgo = Date.now() - 10000;

  if (unloadTimestamp >= tenSecondsAgo) {
    logger.debug('Resuming previous session.');
    localStorage.removeItem('re.notifica.unload_timestamp');
    return;
  }

  await stopSession(currentSession, unloadTimestamp);
  await startSession();
}

export async function unlaunch() {
  const currentSession = getSession();
  const currentDevice = getStoredDevice();

  if (!currentSession || !currentDevice) {
    return;
  }

  await stopSession(currentSession, Date.now());
}

export async function handleDocumentVisibilityChanged() {
  if (!isReady()) return;

  const options = getOptions();
  const device = getStoredDevice();
  if (options?.ignoreTemporaryDevices && !device) return;

  const session = getSession();
  const { visibilityState } = document;

  if (sessionCloseTimeout) {
    window.clearTimeout(sessionCloseTimeout);
    sessionCloseTimeout = undefined;
  }

  if (visibilityState === 'visible' && !session) {
    await startSession();
    return;
  }

  if (visibilityState === 'hidden' && session) {
    sessionCloseTimeout = window.setTimeout(async () => {
      try {
        await stopSession(session, Date.now());
      } catch (e) {
        logger.error('Failed to stop the session after the idle timeout.', e);
      }
    }, TEN_MINUTES_MILLISECONDS);
  }
}

export function handleDocumentBeforeUnload() {
  if (!getSession()) return;

  localStorage.setItem('re.notifica.unload_timestamp', Date.now().toString(10));
}

async function startSession() {
  const session: StoredSession = { id: randomUUID(), start: Date.now() };

  logger.debug(`Session '${session.id}' started at ${session.start} (epoch).`);
  storeSession(session);

  await logApplicationOpen(session.id);
}

async function stopSession(session: StoredSession, sessionCloseTimestamp: number) {
  logger.debug(`Session '${session.id}' stopped at ${sessionCloseTimestamp} (epoch).`);
  storeSession(undefined);

  const sessionLength = (sessionCloseTimestamp - session.start) / 1000;
  await logApplicationClose(session.id, sessionLength, sessionCloseTimestamp);
}
