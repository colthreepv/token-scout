import { type Address } from 'wagmi'
import { arbitrum, bsc } from 'wagmi/chains'

import { WETH_ADDRESS } from './arbitrum'
import { WBNB_ADDRESS } from './bsc'

export type ValidChainId = typeof arbitrum.id | typeof bsc.id

export const tokenWhitelist: Record<ValidChainId, Address[]> = {
  [arbitrum.id]: [WETH_ADDRESS],
  [bsc.id]: [WBNB_ADDRESS],
}
