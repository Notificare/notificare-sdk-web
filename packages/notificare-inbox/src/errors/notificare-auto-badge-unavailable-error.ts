export class NotificareAutoBadgeUnavailableError extends Error {
  constructor() {
    super('Notificare auto badge functionality is not enabled.');
    Object.setPrototypeOf(this, NotificareAutoBadgeUnavailableError.prototype);
  }
}
