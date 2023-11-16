import { CloudDynamicLink } from '@notificare/web-cloud-api';
import { NotificareDynamicLink } from '../../../models/notificare-dynamic-link';

export function convertCloudDynamicLinkToPublic(link: CloudDynamicLink): NotificareDynamicLink {
  return {
    target: link.target,
  };
}
