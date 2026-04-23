import { mainnet, sepolia } from "wagmi/chains";

type ChainContracts = {
  exampleContract: `0x${string}`;
};

export const contracts: Record<number, ChainContracts> = {
  [mainnet.id]: {
    exampleContract: "0x0000000000000000000000000000000000000000",
  },
  [sepolia.id]: {
    exampleContract: "0x0000000000000000000000000000000000000000",
  },
};

export const getContracts = (chainId: number): ChainContracts => {
  const chainContracts = contracts[chainId];
  if (!chainContracts) throw new Error(`No contracts configured for chain ${chainId}`);
  return chainContracts;
};
