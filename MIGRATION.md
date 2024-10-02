# MIGRATING

In Notificare 4.x, one of the most significant changes is the immutability of device identifiers. Previously, the `id` property of a `NotificareDevice` would change based on the device's WebPush capability. Now, new devices will be assigned a UUID that remains constant. For existing devices, their current identifier will persist without changes.

## Breaking changes

### Device identifier immutability

As noted, device identifiers are now immutable in Notificare 4.x. Most applications won't need to directly access the device identifier or the push token, as Notificare handles these internally. However, if you do need to access the push token, it is available through the `notificare-web/push` package.

```javascript
import { getSubscription, onSubscriptionChanged } from 'notificare-web/push';
```

### Device registration behavior

In previous versions, the `onDeviceRegistered` event triggered when enabling or disabling remote notifications. With the new immutability of device identifiers, this event will now only trigger once — when the device is initially created.

If you need to track changes when a device switches between a temporary and a push-enabled state (or vice versa), you can listen to the `onSubscriptionChanged` event, as demonstrated in the example above.

## Migration guides for other versions

Looking to migrate from an older version of Notificare? Refer to the following guides for more details:

- [Migrating to 3.0.0](./MIGRATION-3.0.md)

---

As always, if you have anything to add or require further assistance, we are available via our [Support Channel](mailto:support@notifica.re).
