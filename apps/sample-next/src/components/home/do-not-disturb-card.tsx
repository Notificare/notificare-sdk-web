import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/card";
import { Switch } from "@/components/switch";
import { getCurrentDevice, fetchDoNotDisturb, NotificareDoNotDisturb } from "notificare-web/core";
import { InputField } from "@/components/input-field";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";

const DEFAULT_DND_START = "23:00";
const DEFAULT_DND_END = "08:00";

export function DoNotDisturbCard() {
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState(DEFAULT_DND_START);
  const [end, setEnd] = useState(DEFAULT_DND_END);

  useOnDeviceRegistered((device) => {
    console.log("device registered: do-not-disturb card");
  });

  // useEffect(() => {
  //   const device = getCurrentDevice();
  //   setDnd(device?.dnd);
  //
  //   fetchDoNotDisturb()
  //     .then((dnd) => {
  //       if (dnd?.start) setStart(dnd.start);
  //       if (dnd?.end) setEnd(dnd.end);
  //     })
  //     .catch((e) => console.error(`Failed to fetch to dnd: ${e}`));
  // }, []);

  return (
    <Card>
      <CardHeader title="Remote notifications" />

      <CardContent>
        <Switch
          label="Enabled"
          checked={enabled}
          onChange={async (checked) => {
            // setEnabled(checked);
            //
            // try {
            //   if (checked) {
            //     await enableRemoteNotifications();
            //   } else {
            //     await disableRemoteNotifications();
            //   }
            // } catch (e) {
            //   console.log(`Something went wrong: ${e}`);
            // }
          }}
        />

        {/*<InputField*/}
        {/*  id="dnd-start"*/}
        {/*  label="Start"*/}
        {/*  value={dnd?.start ?? ""}*/}
        {/*  onChange={(event) =>*/}
        {/*    setDnd((prevState) => ({*/}
        {/*      ...prevState,*/}
        {/*      start: event.target.value,*/}
        {/*    }))*/}
        {/*  }*/}
        {/*/>*/}

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900">Allowed UI</p>
          <p className="text-sm font-mono lowercase text-gray-400">WIP</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900">Permission</p>
          <p className="text-sm font-mono lowercase text-gray-400">WIP</p>
        </div>
      </CardContent>
    </Card>
  );
}
