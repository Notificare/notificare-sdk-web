export interface CloudApplication {
  readonly _id: string;
  readonly name: string;
  readonly category: string;
  readonly branding?: boolean;
  readonly services?: CloudApplicationServices;
  readonly inboxConfig?: CloudApplicationInboxConfig;
  readonly regionConfig?: CloudApplicationRegionConfig;
  readonly websitePushConfig?: CloudApplicationWebsitePushConfig;
  readonly userDataFields?: CloudApplicationUserDataField[];
  readonly actionCategories?: CloudApplicationActionCategory[];
}

export type CloudApplicationServices = Record<string, boolean>;

export interface CloudApplicationInboxConfig {
  readonly useInbox?: boolean;
  readonly useUserInbox?: boolean;
  readonly autoBadge?: boolean;
}

export interface CloudApplicationRegionConfig {
  readonly proximityUUID?: string;
}

export interface CloudApplicationWebsitePushConfig {
  readonly icon?: string;
  readonly allowedDomains?: string[];
  readonly urlFormatString?: string;
  readonly info?: CloudApplicationWebsitePushConfigInfo;
  readonly vapid?: CloudApplicationWebsitePushConfigVapid;
  readonly launchConfig?: CloudApplicationWebsitePushConfigLaunchConfig;
}

export interface CloudApplicationWebsitePushConfigInfo {
  readonly subject?: {
    readonly UID?: string;
    readonly CN?: string;
    readonly OU?: string;
    readonly O?: string;
    readonly C?: string;
  };
}

export interface CloudApplicationWebsitePushConfigVapid {
  readonly publicKey?: string;
}

export interface CloudApplicationWebsitePushConfigLaunchConfig {
  readonly autoOnboardingOptions?: CloudApplicationWebsitePushConfigLaunchConfigAutoOnboarding;
  readonly floatingButtonOptions?: CloudApplicationWebsitePushConfigLaunchConfigFloatingButton;
}

export interface CloudApplicationWebsitePushConfigLaunchConfigAutoOnboarding {
  readonly message?: string;
  readonly cancelButton?: string;
  readonly acceptButton?: string;
  readonly retryAfterHours?: number;
  readonly showAfterSeconds?: number;
}

export interface CloudApplicationWebsitePushConfigLaunchConfigFloatingButton {
  readonly alignment: {
    readonly horizontal: string;
    readonly vertical: string;
  };
  readonly permissionTexts: {
    readonly default: string;
    readonly granted: string;
    readonly denied: string;
  };
}

export interface CloudApplicationUserDataField {
  readonly type?: string;
  readonly key?: string;
  readonly label?: string;
}

export interface CloudApplicationActionCategory {
  readonly type?: string;
  readonly name?: string;
  readonly description?: string;
  readonly actions?: CloudApplicationActionCategoryAction[];
}

export interface CloudApplicationActionCategoryAction {
  readonly _id: string;
  readonly type: string;
  readonly label?: string;
  readonly target?: string;
  readonly camera?: boolean;
  readonly keyboard?: boolean;
  readonly destructive?: boolean;
  readonly icon?: CloudApplicationActionCategoryActionIcon;
}

export interface CloudApplicationActionCategoryActionIcon {
  readonly android?: string;
  readonly ios?: string;
  readonly web?: string;
}
