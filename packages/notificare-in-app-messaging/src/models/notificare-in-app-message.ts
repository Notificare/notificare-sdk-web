export interface NotificareInAppMessage {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly context: string[];
  readonly title?: string;
  readonly message?: string;
  readonly image?: string;
  readonly landscapeImage?: string;
  readonly delaySeconds: number;
  readonly primaryAction?: NotificareInAppMessageAction;
  readonly secondaryAction?: NotificareInAppMessageAction;
}

export interface NotificareInAppMessageAction {
  readonly label?: string;
  readonly destructive: boolean;
  readonly url?: string;
}
