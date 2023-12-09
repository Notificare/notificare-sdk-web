import { CloudDoNotDisturb } from '../models/do-not-disturb';

export interface CloudDeviceDoNotDisturbResponse {
  readonly dnd?: CloudDoNotDisturb | null;
}
