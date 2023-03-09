import { registerComponent } from '@notificare/core';
import { PushComponent } from './internal/push-component';

export function registerComponents() {
  registerComponent(new PushComponent());
}
