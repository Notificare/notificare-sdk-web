export class NotificareNotReadyError extends Error {
  constructor() {
    super('Notificare is not ready.');
    Object.setPrototypeOf(this, NotificareNotReadyError.prototype);
  }
}
