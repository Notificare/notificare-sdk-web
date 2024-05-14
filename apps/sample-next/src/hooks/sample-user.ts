import { useEffect } from "react";
import { registerDevice } from "notificare-web/core";
import { useNotificareState } from "@/notificare/hooks/notificare-state";
import { logger } from "@/utils/logger";

export function useSampleUser() {
  const { status } = useNotificareState();

  useEffect(() => {
    if (status !== "launched") return;

    const userId = process.env.NEXT_PUBLIC_SAMPLE_USER_ID;
    const userName = process.env.NEXT_PUBLIC_SAMPLE_USER_NAME;

    if (userId === undefined && userName === undefined) return;

    registerDevice({ userId: userId ?? null, userName: userName ?? null })
      .then(() => logger.info("Updated registered user."))
      .catch((e) => logger.error("Failed to register user.", e));
  }, [status]);
}
