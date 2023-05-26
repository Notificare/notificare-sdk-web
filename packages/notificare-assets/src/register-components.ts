import { registerComponent } from '@notificare/core';
import { AssetsComponent } from './internal/assets-component';

export function registerComponents() {
  registerComponent(new AssetsComponent());
}
