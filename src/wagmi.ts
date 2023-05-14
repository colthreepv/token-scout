import { configureChains, createConfig, Chain } from 'wagmi'
import { arbitrum } from '@wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import networks from './networks.json'
import { InjectedConnector } from 'wagmi/connectors/injected'

const arbitrumCustom: Chain = {
  ...arbitrum,
  rpcUrls: {
    ...arbitrum.rpcUrls,
    default: {
      http: networks,
    },
    public: {
      http: networks,
    }
  }
}

const { chains, publicClient } = configureChains(
  [arbitrumCustom],
  [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }) })],
  { rank: true }
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    new InjectedConnector({ chains })
  ]
})
