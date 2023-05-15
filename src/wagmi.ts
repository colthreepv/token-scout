import { arbitrum, bsc } from '@wagmi/chains'
import { type Chain, configureChains, createConfig } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { rpcs as arbitrumRpcs } from '@/networks/arbitrum'
import { rpcs as bscRpcs } from '@/networks/bsc'
import { getRandomElement } from '@/utils/random.util'

const arbitrumCustom: Chain = {
  ...arbitrum,
  rpcUrls: {
    ...arbitrum.rpcUrls,
    default: { http: arbitrumRpcs },
    public: { http: arbitrumRpcs },
  },
}

const bscCustom: Chain = {
  ...bsc,
  rpcUrls: {
    ...bsc.rpcUrls,
    default: { http: bscRpcs },
    public: { http: bscRpcs },
  },
}

const { chains, publicClient } = configureChains(
  [arbitrumCustom, bscCustom],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: getRandomElement(chain.rpcUrls.default.http)! }),
    }),
  ],
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [new InjectedConnector({ chains })],
})
