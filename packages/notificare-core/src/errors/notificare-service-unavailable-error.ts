export class NotificareServiceUnavailableError extends Error {
  constructor(readonly service: string) {
    super(
      `Notificare '${service}' service is not available. Check the dashboard and documentation to enable it.`,
    );
    Object.setPrototypeOf(this, NotificareServiceUnavailableError.prototype);
  }
}
