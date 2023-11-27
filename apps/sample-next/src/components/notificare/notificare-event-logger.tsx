"use client";

import { useOnReady } from "@/notificare/hooks/events/core/ready";
import { useOnUnlaunched } from "@/notificare/hooks/events/core/unlaunched";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";
import { useOnInboxUpdated } from "@/notificare/hooks/events/inbox/inbox-updated";
import { useOnBadgeUpdated } from "@/notificare/hooks/events/inbox/badge-updated";
import { useOnNotificationReceived } from "@/notificare/hooks/events/push/notification-received";
import { useOnSystemNotificationReceived } from "@/notificare/hooks/events/push/system-notification-received";
import { useOnUnknownNotificationReceived } from "@/notificare/hooks/events/push/unknown-notification-received";
import { useOnNotificationOpened } from "@/notificare/hooks/events/push/notification-opened";
import { useOnNotificationActionOpened } from "@/notificare/hooks/events/push/notification-action-opened";
import { useOnLocationUpdated } from "@/notificare/hooks/events/geo/location-updated";
import { useOnLocationUpdateError } from "@/notificare/hooks/events/geo/location-update-error";
import { useOnMessagePresented } from "@/notificare/hooks/events/in-app-messaging/message-presented";
import { useOnMessageFinishedPresenting } from "@/notificare/hooks/events/in-app-messaging/message-finished-presenting";
import { useOnMessageFailedToPresent } from "@/notificare/hooks/events/in-app-messaging/message-failed-to-present";
import { useOnMessageActionExecuted } from "@/notificare/hooks/events/in-app-messaging/message-action-executed";
import { useOnMessageActionFailedToExecute } from "@/notificare/hooks/events/in-app-messaging/message-action-failed-to-execute";
import { useOnNotificationWillPresent } from "@/notificare/hooks/events/push-ui/notification-will-present";
import { useOnNotificationPresented } from "@/notificare/hooks/events/push-ui/notification-presented";
import { useOnNotificationFinishedPresenting } from "@/notificare/hooks/events/push-ui/notification-finished-presenting";
import { useOnNotificationFailedToPresent } from "@/notificare/hooks/events/push-ui/notification-failed-to-present";
import { useOnNotificationActionWillExecute } from "@/notificare/hooks/events/push-ui/notification-action-will-execute";
import { useOnNotificationActionExecuted } from "@/notificare/hooks/events/push-ui/notification-action-executed";
import { useOnNotificationActionFailedToExecute } from "@/notificare/hooks/events/push-ui/notification-action-failed-to-execute";
import { useOnNotificationCustomActionReceived } from "@/notificare/hooks/events/push-ui/notification-custom-action-received";

export function NotificareEventLogger() {
  /**
   * Core events
   */
  useOnReady((application) => {
    console.log(`notificare is ready`);
    console.log(application);
  });

  useOnUnlaunched(() => {
    console.log("unlaunched");
  });

  useOnDeviceRegistered((device) => {
    console.log("device registered");
    console.log(device);
  });

  /**
   * Geo events
   */
  useOnLocationUpdated((location) => {
    console.log("location updated");
    console.log(location);
  });

  useOnLocationUpdateError((error) => {
    console.log("location update error");
    console.log(error);
  });

  /**
   * In-app messaging events
   */
  useOnMessagePresented((message) => {
    console.log("message presented");
    console.log(message);
  });

  useOnMessageFinishedPresenting((message) => {
    console.log("message finished presenting");
    console.log(message);
  });

  useOnMessageFailedToPresent((message) => {
    console.log("message failed to present");
    console.log(message);
  });

  useOnMessageActionExecuted((message, action) => {
    console.log("message action executed");
    console.log({ message, action });
  });

  useOnMessageActionFailedToExecute((message, action) => {
    console.log("message action failed to execute");
    console.log({ message, action });
  });

  /**
   * Inbox events
   */
  useOnInboxUpdated(() => {
    console.log("inbox updated");
  });

  useOnBadgeUpdated((badge) => {
    console.log(`badge updated = ${badge}`);
  });

  /**
   * Push events
   */
  useOnNotificationReceived((notification, deliveryMechanism) => {
    console.log("notification received");
    console.log({ notification, deliveryMechanism });
  });

  useOnSystemNotificationReceived((notification) => {
    console.log("system notification received");
    console.log(notification);
  });

  useOnUnknownNotificationReceived((notification) => {
    console.log("unknown notification received");
    console.log(notification);
  });

  useOnNotificationOpened((notification) => {
    console.log("notification opened");
    console.log(notification);
  });

  useOnNotificationActionOpened((notification, action) => {
    console.log("notification opened");
    console.log({ notification, action });
  });

  /**
   * Push UI events
   */
  useOnNotificationWillPresent((notification) => {
    console.log("notification will present");
    console.log(notification);
  });

  useOnNotificationPresented((notification) => {
    console.log("notification presented");
    console.log(notification);
  });

  useOnNotificationFinishedPresenting((notification) => {
    console.log("notification finished presenting");
    console.log(notification);
  });

  useOnNotificationFailedToPresent((notification) => {
    console.log("notification failed to present");
    console.log(notification);
  });

  useOnNotificationActionWillExecute((notification, action) => {
    console.log("notification action will execute");
    console.log({ notification, action });
  });

  useOnNotificationActionExecuted((notification, action) => {
    console.log("notification action executed");
    console.log({ notification, action });
  });

  useOnNotificationActionFailedToExecute((notification, action) => {
    console.log("notification action failed to execute");
    console.log({ notification, action });
  });

  useOnNotificationCustomActionReceived((notification, action, target) => {
    console.log("notification custom action received");
    console.log({ notification, action, target });
  });

  return null;
}
