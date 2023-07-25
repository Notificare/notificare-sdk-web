import { logger } from './logger';
import { Component } from './component';

export const components = new Map<string, Component>();

export function registerComponent(component: Component) {
  if (components.has(component.name)) {
    logger.debug(`The component ${component.name} was registered already.`);
    return;
  }

  components.set(component.name, component);
}

export function broadcastComponentEvent(event: string, data?: unknown) {
  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    component.processBroadcast(event, data);
  }
}
