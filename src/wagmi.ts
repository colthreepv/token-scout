import { arbitrum } from '@wagmi/chains'
import { type Chain, configureChains, createConfig } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { rpcs } from './arbitrum'

const arbitrumCustom: Chain = {
  ...arbitrum,
  rpcUrls: {
    ...arbitrum.rpcUrls,
    default: {
      http: rpcs,
    },
    public: {
      http: rpcs,
    },
  },
}

const { chains, publicClient } = configureChains(
  [arbitrumCustom],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[7] }),
    }),
  ],
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [new InjectedConnector({ chains })],
})
