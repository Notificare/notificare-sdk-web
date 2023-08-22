import { registerComponent } from '@notificare/web-core';
import { GeoComponent } from './internal/geo-component';

export function registerComponents() {
  registerComponent(new GeoComponent());
}
