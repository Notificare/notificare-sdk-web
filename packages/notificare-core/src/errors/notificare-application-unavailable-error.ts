export class NotificareApplicationUnavailableError extends Error {
  constructor() {
    super(
      'Notificare application unavailable at the moment. It becomes available after the first ready event.',
    );
    Object.setPrototypeOf(this, NotificareApplicationUnavailableError.prototype);
  }
}
