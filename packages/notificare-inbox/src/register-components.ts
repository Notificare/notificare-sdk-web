import { registerComponent } from '@notificare/core';
import { InboxComponent } from './internal/inbox-component';

export function registerComponents() {
  registerComponent(new InboxComponent());
}
