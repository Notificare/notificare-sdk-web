import { registerComponent } from '@notificare/web-core';
import { IamComponent } from './internal/iam-component';

export function registerComponents() {
  registerComponent(new IamComponent());
}
