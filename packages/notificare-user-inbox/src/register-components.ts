import { registerComponent } from '@notificare/core';
import { UserInboxComponent } from './internal/user-inbox-component';

export function registerComponents() {
  registerComponent(new UserInboxComponent());
}
