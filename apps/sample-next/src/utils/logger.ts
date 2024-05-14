import { Logger } from "@notificare/web-logger";

export const logger = new Logger("sample-next", {
  group: "sample",
  includeName: false,
  includeLogLevel: false,
});

logger.setLogLevel("debug");
