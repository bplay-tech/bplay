import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia, type AppKitNetwork } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
