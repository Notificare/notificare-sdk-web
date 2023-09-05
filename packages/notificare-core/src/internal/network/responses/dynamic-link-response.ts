import { NotificareDynamicLink } from '../../../models/notificare-dynamic-link';

export interface NetworkDynamicLinkResponse {
  link: {
    target: string;
  };
}

export interface NetworkDynamicLink {
  target: string;
}

export function convertNetworkDynamicLinkToPublic(
  networkDynamicLink: NetworkDynamicLink,
): NotificareDynamicLink {
  return {
    target: networkDynamicLink.target,
  };
}
