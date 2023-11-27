import {
  OnDeviceRegisteredCallback,
  OnReadyCallback,
  OnUnlaunchedCallback,
} from "notificare-web/core";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificareCoreListener = ReadyListener | UnlaunchedListener | DeviceRegisteredListener;

export type ReadyListener = TypedListener<"ready", OnReadyCallback>;

export type UnlaunchedListener = TypedListener<"unlaunched", OnUnlaunchedCallback>;

export type DeviceRegisteredListener = TypedListener<
  "device_registered",
  OnDeviceRegisteredCallback
>;
