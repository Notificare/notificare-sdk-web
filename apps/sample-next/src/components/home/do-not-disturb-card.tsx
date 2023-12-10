import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearDoNotDisturb,
  fetchDoNotDisturb,
  updateDoNotDisturb,
  getCurrentDevice,
} from "notificare-web/core";
import { Button } from "@/components/button";
import { Card, CardActions, CardContent, CardHeader } from "@/components/card";
import { InputField } from "@/components/input-field";
import { Switch } from "@/components/switch";

const DEFAULT_DND_START = "23:00";
const DEFAULT_DND_END = "08:00";
const TIME_REGEX = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export function DoNotDisturbCard() {
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    const device = getCurrentDevice();

    setEnabled(device?.dnd !== undefined);
    if (device?.dnd?.start) setStart(device.dnd.start);
    if (device?.dnd?.end) setEnd(device.dnd.end);

    fetchDoNotDisturb()
      .then((dnd) => {
        setEnabled(!!dnd);
        if (dnd?.start) setStart(dnd.start);
        if (dnd?.end) setEnd(dnd.end);
      })
      .catch((e) => console.error(`Failed to fetch to dnd: ${e}`));
  }, []);

  const updateDoNotDisturbCallback = useCallback(() => {
    // TODO: notify the user about failures

    if (!enabled) {
      clearDoNotDisturb()
        .then(() => {
          setEnabled(false);
          setStart("");
          setEnd("");
        })
        .catch((e) => `Failed to clear the dnd: ${e}`);

      return;
    }

    updateDoNotDisturb({
      start,
      end,
    }).catch((e) => `Failed to update the dnd: ${e}`);
  }, [enabled, start, end]);

  const isValid = useMemo<boolean>(() => {
    if (!enabled) return true;

    if (!start.match(TIME_REGEX)) return false;
    // noinspection RedundantIfStatementJS
    if (!end.match(TIME_REGEX)) return false;

    return true;
  }, [enabled, start, end]);

  return (
    <Card>
      <CardHeader title="Do not disturb" />

      <CardContent>
        <Switch
          label="Enabled"
          checked={enabled}
          onChange={(checked) => {
            setEnabled(checked);
            setStart(checked ? DEFAULT_DND_START : "");
            setEnd(checked ? DEFAULT_DND_END : "");
          }}
        />

        <InputField
          id="dnd-start"
          label="Start"
          value={start}
          disabled={!enabled}
          onChange={(event) => setStart(event.target.value)}
        />

        <InputField
          id="dnd-end"
          label="End"
          value={end}
          disabled={!enabled}
          onChange={(event) => setEnd(event.target.value)}
        />
      </CardContent>
      <CardActions>
        <Button text="Save" disabled={!isValid} onClick={updateDoNotDisturbCallback} />
      </CardActions>
    </Card>
  );
}
