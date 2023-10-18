export interface NetworkDynamicLinkResponse {
  link: {
    target: string;
  };
}

export interface NetworkDynamicLink {
  target: string;
}

export interface NetworkPassResponse {
  pass: NetworkPass;
}

export interface NetworkPass {
  version: number;
}

export interface NetworkSaveLinksResponse {
  saveLinks?: NetworkSaveLinks;
}

export interface NetworkSaveLinks {
  googlePay?: string;
  appleWallet?: string;
}
