import { registerComponent } from '@notificare/web-core';
import { PushUiComponent } from './internal/push-ui-component';

export function registerComponents() {
  registerComponent(new PushUiComponent());
}
