import { useQuery } from '@tanstack/react-query'
import { type Address } from 'wagmi'

import { type DexPairInfo } from './dexscreener.types'

type DexScreenerChain = 'ethereum' | 'bsc' | 'polygon' | 'arbitrum'

export const fetchPairData = async (
  poolAddresses: Address[],
  chain: DexScreenerChain = 'arbitrum',
) => {
  const pairs = poolAddresses.join(',')
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairs}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch pair data')
  }

  return (await response.json()) as DexPairInfo
}

export const usePairInfo = (poolAddress: Address) => {
  return useQuery(
    ['pairInfo', poolAddress],
    async () => await fetchPairData([poolAddress]),
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  )
}
