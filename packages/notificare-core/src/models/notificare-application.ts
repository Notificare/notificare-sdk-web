export interface NotificareApplication {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly branding: boolean;
  readonly services: Record<string, boolean>;
  readonly inboxConfig?: NotificareInboxConfig;
  readonly regionConfig?: NotificareRegionConfig;
  readonly websitePushConfig?: NotificareWebsitePushConfig;
  readonly userDataFields: NotificareUserDataField[];
  readonly actionCategories: NotificareActionCategory[];
}

export interface NotificareInboxConfig {
  readonly useInbox: boolean;
  readonly useUserInbox: boolean;
  readonly autoBadge: boolean;
}

export interface NotificareRegionConfig {
  readonly proximityUUID?: string;
}

export interface NotificareWebsitePushConfig {
  readonly icon: string;
  readonly allowedDomains: string[];
  readonly urlFormatString?: string;
  readonly info?: NotificareWebsitePushConfigInfo;
  readonly vapid?: NotificareWebsitePushConfigVapid;
  readonly launchConfig?: NotificareWebsitePushConfigLaunchConfig;
}

export interface NotificareWebsitePushConfigInfo {
  readonly subject: {
    readonly UID: string;
    readonly CN: string;
    readonly OU: string;
    readonly O: string;
    readonly C: string;
  };
}

export interface NotificareWebsitePushConfigVapid {
  readonly publicKey: string;
}

export interface NotificareWebsitePushConfigLaunchConfig {
  readonly autoOnboardingOptions?: NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions;
  readonly floatingButtonOptions?: NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions;
}

export interface NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions {
  readonly message: string;
  readonly cancelButton: string;
  readonly acceptButton: string;
  readonly retryAfterHours?: number;
  readonly showAfterSeconds?: number;
}

export interface NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions {
  readonly alignment: {
    readonly horizontal: NotificareWebsitePushConfigLaunchConfigFloatingButtonHorizontalAlignment;
    readonly vertical: NotificareWebsitePushConfigLaunchConfigFloatingButtonVerticalAlignment;
  };
  readonly permissionTexts: NotificareWebsitePushConfigLaunchConfigFloatingButtonPermissionTexts;
}

export type NotificareWebsitePushConfigLaunchConfigFloatingButtonHorizontalAlignment =
  | 'start'
  | 'center'
  | 'end'
  | string;

export type NotificareWebsitePushConfigLaunchConfigFloatingButtonVerticalAlignment =
  | 'top'
  | 'center'
  | 'bottom'
  | string;

export interface NotificareWebsitePushConfigLaunchConfigFloatingButtonPermissionTexts {
  readonly default: string;
  readonly granted: string;
  readonly denied: string;
}

export interface NotificareUserDataField {
  readonly type: string;
  readonly key: string;
  readonly label: string;
}

export interface NotificareActionCategory {
  readonly type: string;
  readonly name: string;
  readonly description?: string;
  readonly actions: NotificareActionCategoryAction[];
}

export interface NotificareActionCategoryAction {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly target?: string;
  readonly keyboard: boolean;
  readonly camera: boolean;
  readonly destructive?: boolean;
  readonly icon?: NotificareActionCategoryActionIcon;
}

export interface NotificareActionCategoryActionIcon {
  readonly android?: string;
  readonly ios?: string;
  readonly web?: string;
}
