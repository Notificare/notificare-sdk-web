import { registerComponent } from './internal/component-cache';
import { DeviceComponent } from './internal/components/device-component';

export function registerCoreComponents() {
  registerComponent(new DeviceComponent());
}
