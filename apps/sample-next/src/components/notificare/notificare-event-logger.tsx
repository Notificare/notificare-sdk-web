"use client";

import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";
import { useOnReady } from "@/notificare/hooks/events/core/ready";
import { useOnUnlaunched } from "@/notificare/hooks/events/core/unlaunched";
import { useOnLocationUpdateError } from "@/notificare/hooks/events/geo/location-update-error";
import { useOnLocationUpdated } from "@/notificare/hooks/events/geo/location-updated";
import { useOnMessageActionExecuted } from "@/notificare/hooks/events/in-app-messaging/message-action-executed";
import { useOnMessageActionFailedToExecute } from "@/notificare/hooks/events/in-app-messaging/message-action-failed-to-execute";
import { useOnMessageFailedToPresent } from "@/notificare/hooks/events/in-app-messaging/message-failed-to-present";
import { useOnMessageFinishedPresenting } from "@/notificare/hooks/events/in-app-messaging/message-finished-presenting";
import { useOnMessagePresented } from "@/notificare/hooks/events/in-app-messaging/message-presented";
import { useOnBadgeUpdated } from "@/notificare/hooks/events/inbox/badge-updated";
import { useOnInboxUpdated } from "@/notificare/hooks/events/inbox/inbox-updated";
import { useOnNotificationActionOpened } from "@/notificare/hooks/events/push/notification-action-opened";
import { useOnNotificationOpened } from "@/notificare/hooks/events/push/notification-opened";
import { useOnNotificationReceived } from "@/notificare/hooks/events/push/notification-received";
import { useOnSystemNotificationReceived } from "@/notificare/hooks/events/push/system-notification-received";
import { useOnUnknownNotificationReceived } from "@/notificare/hooks/events/push/unknown-notification-received";
import { useOnNotificationActionExecuted } from "@/notificare/hooks/events/push-ui/notification-action-executed";
import { useOnNotificationActionFailedToExecute } from "@/notificare/hooks/events/push-ui/notification-action-failed-to-execute";
import { useOnNotificationActionWillExecute } from "@/notificare/hooks/events/push-ui/notification-action-will-execute";
import { useOnNotificationCustomActionReceived } from "@/notificare/hooks/events/push-ui/notification-custom-action-received";
import { useOnNotificationFailedToPresent } from "@/notificare/hooks/events/push-ui/notification-failed-to-present";
import { useOnNotificationFinishedPresenting } from "@/notificare/hooks/events/push-ui/notification-finished-presenting";
import { useOnNotificationPresented } from "@/notificare/hooks/events/push-ui/notification-presented";
import { useOnNotificationWillPresent } from "@/notificare/hooks/events/push-ui/notification-will-present";
import { logger } from "@/utils/logger";

export function NotificareEventLogger() {
  /**
   * Core events
   */
  useOnReady((application) => {
    logger.debug(`notificare is ready`);
    logger.debug(application);
  });

  useOnUnlaunched(() => {
    logger.debug("unlaunched");
  });

  useOnDeviceRegistered((device) => {
    logger.debug("device registered");
    logger.debug(device);
  });

  /**
   * Geo events
   */
  useOnLocationUpdated((location) => {
    logger.debug("location updated");
    logger.debug(location);
  });

  useOnLocationUpdateError((error) => {
    logger.debug("location update error");
    logger.debug(error);
  });

  /**
   * In-app messaging events
   */
  useOnMessagePresented((message) => {
    logger.debug("message presented");
    logger.debug(message);
  });

  useOnMessageFinishedPresenting((message) => {
    logger.debug("message finished presenting");
    logger.debug(message);
  });

  useOnMessageFailedToPresent((message) => {
    logger.debug("message failed to present");
    logger.debug(message);
  });

  useOnMessageActionExecuted((message, action) => {
    logger.debug("message action executed");
    logger.debug({ message, action });
  });

  useOnMessageActionFailedToExecute((message, action) => {
    logger.debug("message action failed to execute");
    logger.debug({ message, action });
  });

  /**
   * Inbox events
   */
  useOnInboxUpdated(() => {
    logger.debug("inbox updated");
  });

  useOnBadgeUpdated((badge) => {
    logger.debug(`badge updated = ${badge}`);
  });

  /**
   * Push events
   */
  useOnNotificationReceived((notification, deliveryMechanism) => {
    logger.debug("notification received");
    logger.debug({ notification, deliveryMechanism });
  });

  useOnSystemNotificationReceived((notification) => {
    logger.debug("system notification received");
    logger.debug(notification);
  });

  useOnUnknownNotificationReceived((notification) => {
    logger.debug("unknown notification received");
    logger.debug(notification);
  });

  useOnNotificationOpened((notification) => {
    logger.debug("notification opened");
    logger.debug(notification);
  });

  useOnNotificationActionOpened((notification, action) => {
    logger.debug("notification opened");
    logger.debug({ notification, action });
  });

  /**
   * Push UI events
   */
  useOnNotificationWillPresent((notification) => {
    logger.debug("notification will present");
    logger.debug(notification);
  });

  useOnNotificationPresented((notification) => {
    logger.debug("notification presented");
    logger.debug(notification);
  });

  useOnNotificationFinishedPresenting((notification) => {
    logger.debug("notification finished presenting");
    logger.debug(notification);
  });

  useOnNotificationFailedToPresent((notification) => {
    logger.debug("notification failed to present");
    logger.debug(notification);
  });

  useOnNotificationActionWillExecute((notification, action) => {
    logger.debug("notification action will execute");
    logger.debug({ notification, action });
  });

  useOnNotificationActionExecuted((notification, action) => {
    logger.debug("notification action executed");
    logger.debug({ notification, action });
  });

  useOnNotificationActionFailedToExecute((notification, action) => {
    logger.debug("notification action failed to execute");
    logger.debug({ notification, action });
  });

  useOnNotificationCustomActionReceived((notification, action, target) => {
    logger.debug("notification custom action received");
    logger.debug({ notification, action, target });
  });

  return null;
}
