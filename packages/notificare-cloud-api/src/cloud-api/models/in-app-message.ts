export interface CloudInAppMessage {
  readonly _id: string;
  readonly name: string;
  readonly type: string;
  readonly context?: string[];
  readonly title?: string;
  readonly message?: string;
  readonly image?: string;
  readonly landscapeImage?: string;
  readonly delaySeconds?: number;
  readonly primaryAction?: CloudInAppMessageAction;
  readonly secondaryAction?: CloudInAppMessageAction;
}

export interface CloudInAppMessageAction {
  readonly label?: string;
  readonly destructive?: boolean;
  readonly url?: string;
}
