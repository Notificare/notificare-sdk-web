import { Component } from './component';
import { logger } from './logger';

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

export async function executeComponentCommand({
  component,
  command,
  data,
}: {
  component: string;
  command: string;
  data?: unknown;
}): Promise<unknown> {
  const instance = components.get(component);
  if (!instance) throw new Error(`Unable to find an instance for component '${component}'.`);

  return instance.executeCommand(command, data);
}
