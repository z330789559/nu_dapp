import {bsc} from "viem/chains";
import {configureChains, createConfig} from "wagmi";
import {connectorsForWallets} from "@rainbow-me/rainbowkit";
import {jsonRpcProvider} from 'wagmi/providers/jsonRpc';

import {
  argentWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  tokenPocketWallet,
  trustWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";

export const {chains, publicClient} = configureChains(
  [bsc],
  [
    jsonRpcProvider({rpc: chain => ({http: 'https://bsc-dataseed1.binance.org/'})}),
  ],
);

const projectId = 'f50ee00eb31c4f35a241a2b409999e60';
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({chains, projectId}),
      walletConnectWallet({chains, projectId}),
      tokenPocketWallet({projectId, chains}),
      injectedWallet({chains, projectId}),
      rainbowWallet({chains, projectId}),
    ],
  },
  {
    groupName: 'Other',
    wallets: [
      argentWallet({projectId, chains}),
      trustWallet({projectId, chains}),
      ledgerWallet({projectId, chains}),
    ],
  },
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})