"use client";

import { useEffect } from "react";
import { onDeviceRegistered, onReady, onUnlaunched } from "notificare-web/core";
import { onLocationUpdated } from "notificare-web/geo";
import {
  onActionExecuted as onIamActionExecuted,
  onActionFailedToExecute as onIamActionFailedToExecute,
  onMessageFailedToPresent,
  onMessageFinishedPresenting,
  onMessagePresented,
} from "notificare-web/in-app-messaging";
import { onBadgeUpdated, onInboxUpdated } from "notificare-web/inbox";
import {
  onNotificationActionOpened,
  onNotificationOpened,
  onNotificationReceived,
  onSystemNotificationReceived,
  onUnknownNotificationReceived,
} from "notificare-web/push";
import {
  onActionExecuted,
  onActionFailedToExecute,
  onActionWillExecute,
  onCustomActionReceived,
  onNotificationFailedToPresent,
  onNotificationFinishedPresenting,
  onNotificationPresented,
  onNotificationWillPresent,
  presentAction,
  presentNotification,
} from "notificare-web/push-ui";

export function NotificareEventListener() {
  // Notificare events can only have one handler at all times.
  // When a child component subscribes to an event, this event listener
  // won't pick it up anymore.

  useEffect(function setupCoreEvents() {
    const subscriptions = [
      onDeviceRegistered((device) => {
        console.log(`device registered = ${JSON.stringify(device)}`);
      }),
      onReady((application) => {
        console.log(`ready = ${JSON.stringify(application)}`);
      }),
      onUnlaunched(() => {
        console.log("unlaunched");
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  useEffect(function setupGeoEvents() {
    const subscriptions = [
      onLocationUpdated((location) => {
        console.log(`location updated = ${JSON.stringify(location)}`);
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  useEffect(function setupInAppMessagingEvents() {
    const subscriptions = [
      onMessagePresented((message) => {
        console.log(`message presented = ${JSON.stringify(message)}`);
      }),
      onMessageFinishedPresenting((message) => {
        console.log(`message finished presenting = ${JSON.stringify(message)}`);
      }),
      onMessageFailedToPresent((message) => {
        console.log(`message failed to present = ${JSON.stringify(message)}`);
      }),
      onIamActionExecuted((notification, action) => {
        console.log(`action executed = ${JSON.stringify({ notification, action })}`);
      }),
      onIamActionFailedToExecute((message, action) => {
        console.log(`action failed to execute = ${JSON.stringify({ message, action })}`);
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  useEffect(function setupInboxEvents() {
    const subscriptions = [
      onInboxUpdated(() => {
        console.log("inbox updated");
      }),
      onBadgeUpdated((badge) => {
        console.log(`badge updated = ${badge}`);
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  useEffect(function setupPushEvents() {
    const subscriptions = [
      onNotificationReceived((notification, deliveryMechanism) => {
        console.log(
          `notification received = ${JSON.stringify({ notification, deliveryMechanism })}`,
        );
      }),
      onNotificationOpened((notification) => {
        console.log(`notification opened = ${JSON.stringify(notification)}`);

        presentNotification(notification);
      }),
      onNotificationActionOpened((notification, action) => {
        console.log(`notification action opened = ${JSON.stringify({ notification, action })}`);

        presentAction(notification, action);
      }),
      onSystemNotificationReceived((notification) => {
        console.log(`system notification received = ${JSON.stringify(notification)}`);
      }),
      onUnknownNotificationReceived((notification) => {
        console.log(`unknown notification received = ${JSON.stringify(notification)}`);
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  useEffect(function setupPushUiEvents() {
    const subscriptions = [
      onNotificationWillPresent((notification) => {
        console.log(`notification will present = ${JSON.stringify(notification)}`);
      }),
      onNotificationPresented((notification) => {
        console.log(`notification presented = ${JSON.stringify(notification)}`);
      }),
      onNotificationFinishedPresenting((notification) => {
        console.log(`notification finished presenting = ${JSON.stringify(notification)}`);
      }),
      onNotificationFailedToPresent((notification) => {
        console.log(`notification failed to present = ${JSON.stringify(notification)}`);
      }),
      onActionWillExecute((notification, action) => {
        console.log(`action will execute = ${JSON.stringify({ notification, action })}`);
      }),
      onActionExecuted((notification, action) => {
        console.log(`action executed = ${JSON.stringify({ notification, action })}`);
      }),
      onActionFailedToExecute((notification, action) => {
        console.log(`action failed to execute = ${JSON.stringify({ notification, action })}`);
      }),
      onCustomActionReceived((notification, action, target) => {
        console.log(`custom action received = ${JSON.stringify({ notification, action, target })}`);

        window.location.href = target;
      }),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  return null;
}
