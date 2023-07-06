export {
  onMessagePresented,
  onMessageFinishedPresenting,
  onMessageFailedToPresent,
  onActionExecuted,
  onActionFailedToExecute,
} from './internal/consumer-events';

export function hasMessagesSuppressed(): boolean {
  return false;
}

export function setMessagesSuppressed(suppressed: boolean, evaluateContext: boolean) {
  //
}
