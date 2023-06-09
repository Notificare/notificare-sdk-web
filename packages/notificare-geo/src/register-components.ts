import { registerComponent } from '@notificare/core';
import { GeoComponent } from './internal/geo-component';

export function registerComponents() {
  registerComponent(new GeoComponent());
}
