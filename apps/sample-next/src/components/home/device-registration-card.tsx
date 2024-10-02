import { useCallback, useState } from "react";
import { getCurrentDevice, updateUser } from "notificare-web/core";
import { Button } from "@/components/button";
import { Card, CardActions, CardContent, CardHeader } from "@/components/card";
import { InputField } from "@/components/input-field";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";
import { logger } from "@/utils/logger";

export function DeviceRegistrationCard() {
  const device = getCurrentDevice();

  const [userId, setUserId] = useState<string>(device?.userId ?? "");
  const [userName, setUserName] = useState<string>(device?.userName ?? "");
  const [loading, setLoading] = useState<boolean>(false);

  useOnDeviceRegistered((device) => {
    setUserId(device.userId ?? "");
    setUserName(device.userName ?? "");
  });

  const onRegisterClick = useCallback(() => {
    setLoading(true);

    updateUser({ userId: userId.trim() || null, userName: userName.trim() || null })
      .then(() => setLoading(false))
      .catch((e) => {
        logger.error(`Unable to register device: ${e}`);
        setLoading(false);
      });
  }, [userId, userName]);

  return (
    <Card>
      <CardHeader title="Device registration" />

      <CardContent>
        <InputField
          id="user-id"
          label="User ID"
          placeholder="63d38bb3-0d2b-4059-b2d2-775a9deae263"
          disabled={loading}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <InputField
          id="user-name"
          label="User name"
          placeholder="John Doe"
          disabled={loading}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </CardContent>

      <CardActions>
        <Button text="Register" disabled={loading} onClick={onRegisterClick} />
      </CardActions>
    </Card>
  );
}
