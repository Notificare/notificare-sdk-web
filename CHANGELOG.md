# CHANGELOG

## 3.6.0

- Report back errors in `launch()` and `unlaunch()`
- Remove push onboarding branding
- Add support for the URLResolver notification type

## 3.5.0

- Session close events now report the time when they happened instead of when they're sent
- Prevent duplicate session close events
- Recover push enrolment based on browser permission
- Remove onboarding elements when un-launching

## 3.4.0

- Fix device's last registered date encoding
- Remove the default icon from the notification preview when there is no `image` support
- Refresh the WebPush subscription when the current one is considered valid
- Fallback to presenting the root page when the notification contains invalid content
- Prevent concurrent registrations when the permission changes

## 3.3.0

- Set the last onboarding attempt when accepting it preventing re-prompting when notifications are blocked
- Enable remote notifications when manually changing the permission after opting-in

## 3.2.0

- Monitor notification permission changes
- Add `onNotificationSettingsChanged` event for a more accurate `allowedUI`
- Fix device do not disturb returning `null` instead of `undefined`
- Fix auto-enable remote notifications blocking the launch flow
- Prevent the `onDeviceRegistered` event from invoking before the `onReady` event
- Ensure `hasRemoteNotificationEnabled()` returns an accurate value when `onDeviceRegistered` is executed

## 3.2.0-beta.1

- Monitor notification permission changes
- Add `onNotificationSettingsChanged` event for a more accurate `allowedUI`
- Fix device do not disturb returning `null` instead of `undefined`
- Fix auto-enable remote notifications blocking the launch flow
- Prevent the `onDeviceRegistered` event from invoking before the `onReady` event
- Ensure `hasRemoteNotificationEnabled()` returns an accurate value when `onDeviceRegistered` is executed

## 3.1.1

- Update JS target to ES6 for CommonJS builds

## 3.1.0

#### Important changes since 3.0.0

- Add support for dark mode
- Add `data-notificare-theme` attribute to override the default theme
- Add utility to load external stylesheets
- Prevent click outside to dismiss the auto-onboarding prompt
- Process notifications in the service worker when possible
- Fix standalone mode detection in Safari Desktop & Chrome Mobile
- Fix open notification in Chrome Mobile
- Fix in-app browser action reply tracker
- Export `NotificareOptions`

## 3.1.0-beta.2

- Add `data-notificare-theme` attribute to override the default theme
- Prevent click outside to dismiss the auto-onboarding prompt

## 3.1.0-beta.1

- Add support for dark mode
- Add utility to load external stylesheets
- Process notifications in the service worker when possible
- Fix standalone mode detection in Safari Desktop & Chrome Mobile
- Fix open notification in Chrome Mobile
- Fix in-app browser action reply tracker
- Export `NotificareOptions`

## 3.0.0

Check our [migration guide](./MIGRATION.md) before adopting the v3.x generation.

- Explicitly resolve Notificare Links
- Show passes natively whenever possible
- Fix exported definition files

## 3.0.0-beta.3

Check our [migration guide](./MIGRATION.md) before adopting the v3.x generation.

- Fix user registration for Web Push devices
- Prevent undefined string in asset url
- Fix launch flow for disabled auto-badge apps
- Add `onInboxUpdated` event

## 3.0.0-beta.2

Check our [migration guide](./MIGRATION.md) before adopting the v3.x generation.

- Fix notification UI for image content
- Prevent Safari Push from replacing Web Push
- Auto-enable remote notifications & location updates when opted-in
- Improve location clean-ups
- Add default location for the service worker
- Add validation to options
- Change the configuration file from `config.json` to `notificare-services.json`
- Change the package from `notificare` to `notificare-web`
- Distribute production-ready CSS files through `notificare-web`
- Add CSS resets to improve UI consistency
- Fix duplicate replies in quick actions
- Add migration from v2 storage
- Add `ignoreTemporaryDevices` and `ignoreUnsupportedWebPushDevices` options
- Fix readiness state in service worker
- Add allowedUI getter

## 3.0.0-beta.1

Check our [migration guide](./MIGRATION.md) before adopting the v3.x generation.
