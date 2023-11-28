import { useEffect, useState } from "react";
import {
  disableRemoteNotifications,
  enableRemoteNotifications,
  hasRemoteNotificationsEnabled,
} from "notificare-web/push";
import { Card, CardContent, CardHeader } from "@/components/card";
import { Switch } from "@/components/switch";

export function NotificationsCard() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enabled = hasRemoteNotificationsEnabled();
    setEnabled(enabled);
  }, []);

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
          <p className="text-sm font-mono lowercase text-gray-400">WIP</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Permission
          </p>
          <p className="text-sm font-mono lowercase text-gray-400">WIP</p>
        </div>
      </CardContent>
    </Card>
  );
}
