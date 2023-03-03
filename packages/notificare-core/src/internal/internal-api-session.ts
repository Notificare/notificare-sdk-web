import { isReady } from '../public-api';
import { logger } from './logger';
import { logApplicationClose, logApplicationOpen } from './internal-api-events';
import { randomUUID } from './utils';
import { getSession, StoredSession, storeSession } from './internal-api-session-shared';

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
    return;
  }

  await stopSession(currentSession, unloadTimestamp);
  await startSession();
}

export async function handleDocumentVisibilityChanged() {
  if (!isReady()) return;

  const session = getSession();
  const { visibilityState } = document;

  if (visibilityState === 'visible' && !session) {
    await startSession();

    if (sessionCloseTimeout) {
      window.clearTimeout(sessionCloseTimeout);
    }

    return;
  }

  if (visibilityState === 'hidden' && session) {
    sessionCloseTimeout = window.setTimeout(async () => {
      try {
        await stopSession(session, Date.now());
      } catch (e) {
        logger.error('Failed to stop the session after the idle timeout.', e);
      }
    }, 600000);
  }
}

export function handleDocumentBeforeUnload() {
  localStorage.setItem('re.notifica.unload_timestamp', Date.now().toString(10));
}

async function startSession() {
  const session: StoredSession = { id: randomUUID(), start: Date.now() };

  logger.debug(`Session '${session.id}' started at ${session.start} (epoch).`);
  storeSession(session);

  await logApplicationOpen(session.id);
}

async function stopSession(session: StoredSession, unloadTimestamp: number) {
  logger.debug(`Session '${session.id}' stopped at ${unloadTimestamp} (epoch).`);
  storeSession(undefined);

  const sessionLength = (unloadTimestamp - session.start) / 1000;
  await logApplicationClose(session.id, sessionLength);
}
