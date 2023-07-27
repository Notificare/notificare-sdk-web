export enum LaunchState {
  NONE,
  CONFIGURED,
  LAUNCHING,
  LAUNCHED,
}

let launchState: LaunchState = LaunchState.NONE;

export function isConfigured(): boolean {
  return getLaunchState() >= LaunchState.CONFIGURED;
}

export function isReady(): boolean {
  return launchState >= LaunchState.LAUNCHED;
}

export function getLaunchState(): LaunchState {
  return launchState;
}

export function setLaunchState(state: LaunchState) {
  launchState = state;
}
