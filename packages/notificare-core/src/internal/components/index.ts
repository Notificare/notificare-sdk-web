import { logger } from '../logger';

export abstract class Component {
  protected constructor(readonly name: string) {}

  abstract launch(): Promise<void>;
}

export const components = new Map<string, Component>();

export function registerComponent(component: Component) {
  if (components.has(component.name)) {
    logger.debug(`The component ${component.name} was registered already.`);
    return;
  }

  components.set(component.name, component);
}
