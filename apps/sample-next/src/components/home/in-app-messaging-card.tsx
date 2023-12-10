import { useEffect, useState } from "react";
import { hasMessagesSuppressed, setMessagesSuppressed } from "notificare-web/in-app-messaging";
import { Card, CardContent, CardHeader } from "@/components/card";
import { Switch } from "@/components/switch";

export function InAppMessagingCard() {
  const [suppressed, setSuppressed] = useState(false);
  const [evaluateContext, setEvaluateContext] = useState(false);

  useEffect(() => {
    setSuppressed(hasMessagesSuppressed());
  }, []);

  return (
    <Card>
      <CardHeader title="In-app messaging" />

      <CardContent>
        <Switch
          label="Suppressed"
          checked={suppressed}
          onChange={(checked) => {
            setSuppressed(checked);
            setMessagesSuppressed(checked, evaluateContext);
          }}
        />

        <Switch label="Evaluate context" checked={evaluateContext} onChange={setEvaluateContext} />
      </CardContent>
    </Card>
  );
}
