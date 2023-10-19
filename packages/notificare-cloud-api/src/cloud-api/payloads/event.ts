export interface CloudCreateEventPayload {
  readonly type: string;
  readonly timestamp: number;
  readonly deviceID?: string;
  readonly userID?: string; // TODO: remove when the API stop processing this property.
  readonly sessionID?: string;
  readonly notification?: string;
  readonly data?: Record<string, unknown>;
}
