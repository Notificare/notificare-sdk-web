import { useEffect, useState } from "react";
import {
  disableRemoteNotifications,
  enableRemoteNotifications,
  hasRemoteNotificationsEnabled,
  getAllowedUI,
  getPushPermissionStatus,
  NotificarePushPermissionStatus,
} from "notificare-web/push";
import { Card, CardContent, CardHeader } from "@/components/card";
import { Switch } from "@/components/switch";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";
import { useOnNotificationSettingsChanged } from "@/notificare/hooks/events/push/notification-settings-changed";

export function NotificationsCard() {
  const [enabled, setEnabled] = useState(false);
  const [allowedUI, setAllowedUI] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificarePushPermissionStatus>();

  useEffect(() => {
    const enabled = hasRemoteNotificationsEnabled();
    setEnabled(enabled);

    const allowedUI = getAllowedUI();
    setAllowedUI(allowedUI);

    const permissionStatus = getPushPermissionStatus();
    setPermissionStatus(permissionStatus);
  }, []);

  useOnDeviceRegistered(() => {
    const enabled = hasRemoteNotificationsEnabled();
    setEnabled(enabled);
  });

  useOnNotificationSettingsChanged((allowedUI) => {
    const enabled = hasRemoteNotificationsEnabled();
    setEnabled(enabled);

    setAllowedUI(allowedUI);

    const permissionStatus = getPushPermissionStatus();
    setPermissionStatus(permissionStatus);
  });

  return (
    <Card>
      <CardHeader title="Remote notifications" />

      <CardContent>
        <Switch
          label="Enabled"
          checked={enabled}
          onChange={async (checked) => {
            setEnabled(checked);

            try {
              if (checked) {
                await enableRemoteNotifications();
              } else {
                await disableRemoteNotifications();
              }
            } catch (e) {
              console.log(`Something went wrong: ${e}`);
            }
          }}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Allowed UI
          </p>
          <p className="text-sm font-mono lowercase text-gray-400">{allowedUI.toString()}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Permission
          </p>
          <p className="text-sm font-mono lowercase text-gray-400">{permissionStatus}</p>
        </div>
      </CardContent>
    </Card>
  );
}
