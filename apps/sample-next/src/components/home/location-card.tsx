import { useEffect, useState } from "react";
import {
  disableLocationUpdates,
  enableLocationUpdates,
  hasLocationServicesEnabled,
} from "notificare-web/geo";
import { Card, CardContent, CardHeader } from "@/components/card";
import { Switch } from "@/components/switch";

export function LocationCard() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enabled = hasLocationServicesEnabled();
    setEnabled(enabled);
  }, []);

  return (
    <Card>
      <CardHeader title="Location updates" />

      <CardContent>
        <Switch
          label="Enabled"
          checked={enabled}
          onChange={async (checked) => {
            setEnabled(checked);

            try {
              if (checked) {
                enableLocationUpdates();
              } else {
                disableLocationUpdates();
              }
            } catch (e) {
              console.log(`Something went wrong: ${e}`);
            }
          }}
        />

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
