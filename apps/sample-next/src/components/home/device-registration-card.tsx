import { getCurrentDevice, registerDevice, RegisterDeviceOptions } from "notificare-web/core";
import { useCallback, useState } from "react";
import { Card, CardActions, CardContent, CardHeader } from "@/components/card";
import { InputField } from "@/components/input-field";
import { Button } from "@/components/button";

export function DeviceRegistrationCard() {
  const device = getCurrentDevice();

  const [userId, setUserId] = useState<string>(device?.userId ?? "");
  const [userName, setUserName] = useState<string>(device?.userName ?? "");
  const [loading, setLoading] = useState<boolean>(false);

  const onRegisterClick = useCallback(() => {
    setLoading(true);

    const options: RegisterDeviceOptions = {
      userId: userId.trim() || null,
      userName: userName.trim() || null,
    };

    registerDevice(options)
      .then(() => setLoading(false))
      .catch((e) => {
        console.error(`Unable to register device: ${e}`);
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
