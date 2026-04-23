import type { Address } from "./index";

export type WalletState = {
  address: Address | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
};

export type SignatureRequest = {
  message: string;
  address: Address;
};
