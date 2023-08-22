import { registerComponent } from '@notificare/web-core';
import { PushComponent } from './internal/push-component';

export function registerComponents() {
  registerComponent(new PushComponent());
}
