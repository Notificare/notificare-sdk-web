export class NotificareNotConfiguredError extends Error {
  constructor() {
    super("Notificare hasn't been configured.");
    Object.setPrototypeOf(this, NotificareNotConfiguredError.prototype);
  }
}
