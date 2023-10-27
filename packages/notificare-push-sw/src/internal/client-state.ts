let clientState: ClientState = 'unready';

export type ClientState = 'ready' | 'unready';

export function getClientState(): ClientState {
  return clientState;
}

export function setClientState(state: ClientState) {
  clientState = state;
}
