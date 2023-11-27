import { OnLocationUpdatedCallback, OnLocationUpdateErrorCallback } from "notificare-web/geo";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificareGeoListener = LocationUpdatedListener | LocationUpdateErrorListener;

export type LocationUpdatedListener = TypedListener<"location_updated", OnLocationUpdatedCallback>;

export type LocationUpdateErrorListener = TypedListener<
  "location_update_error",
  OnLocationUpdateErrorCallback
>;
