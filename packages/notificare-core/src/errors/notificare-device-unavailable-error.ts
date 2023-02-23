export class NotificareDeviceUnavailableError extends Error {
  constructor() {
    super(
      'Notificare device unavailable at the moment. It becomes available after the first ready event.',
    );
    Object.setPrototypeOf(this, NotificareDeviceUnavailableError.prototype);
  }
}
