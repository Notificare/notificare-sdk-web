import { logger } from './logger';

export function getSession(): StoredSession | undefined {
  const sessionStr = localStorage.getItem('re.notifica.session');
  if (!sessionStr) return undefined;

  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    logger.warning('Failed to decode the stored session.', e);

    // Remove the corrupted session from local storage.
    storeSession(undefined);

    return undefined;
  }
}

export function storeSession(session: StoredSession | undefined) {
  if (!session) {
    localStorage.removeItem('re.notifica.session');
    localStorage.removeItem('re.notifica.unload_timestamp');
    return;
  }

  localStorage.setItem('re.notifica.session', JSON.stringify(session));
}

export interface StoredSession {
  readonly id: string;
  readonly start: number;
}
