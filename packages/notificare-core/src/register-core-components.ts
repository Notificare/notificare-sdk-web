import { registerComponent } from './internal/component-cache';
import { DeviceComponent } from './internal/components/device-component';
import { SessionComponent } from './internal/components/session-component';

export function registerCoreComponents() {
  registerComponent(new SessionComponent());
  registerComponent(new DeviceComponent());
}
