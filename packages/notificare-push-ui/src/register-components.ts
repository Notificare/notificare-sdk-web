import { registerComponent } from '@notificare/core';
import { PushUiComponent } from './internal/push-ui-component';

export function registerComponents() {
  registerComponent(new PushUiComponent());
}
