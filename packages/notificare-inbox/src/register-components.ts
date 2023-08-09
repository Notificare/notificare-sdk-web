import { registerComponent } from '@notificare/web-core';
import { InboxComponent } from './internal/inbox-component';

export function registerComponents() {
  registerComponent(new InboxComponent());
}
