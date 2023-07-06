import { registerComponent } from '@notificare/core';
import { IamComponent } from './internal/iam-component';

export function registerComponents() {
  registerComponent(new IamComponent());
}
