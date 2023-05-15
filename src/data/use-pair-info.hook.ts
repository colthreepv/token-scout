import { useQuery } from '@tanstack/react-query'
import PQueue from 'p-queue'
import { type Address } from 'wagmi'
import { arbitrum, bsc, mainnet, polygon } from 'wagmi/chains'

import { type DexPairInfo } from './dexscreener.types'

// dexscreener has a rate limit of 300 requests per minute
const queue = new PQueue({ interval: 60 * 1000, intervalCap: 300 })

type DexScreenerChain = 'ethereum' | 'bsc' | 'polygon' | 'arbitrum'

const chainMap: Record<number, DexScreenerChain> = {
  [mainnet.id]: 'ethereum',
  [bsc.id]: 'bsc',
  [polygon.id]: 'polygon',
  [arbitrum.id]: 'arbitrum',
}

export const fetchPairData = async (
  poolAddresses: Address[],
  chain: DexScreenerChain,
) => {
  const pairs = poolAddresses.join(',')
  const response = await queue.add(
    async () =>
      await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairs}`,
      ),
    { throwOnTimeout: true },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch pair data')
  }

  return (await response.json()) as DexPairInfo
}

export const usePairInfo = (poolAddress: Address, chainId: number) => {
  return useQuery({
    queryKey: ['pair-info', poolAddress, chainId],
    queryFn: async () => await fetchPairData([poolAddress], chainMap[chainId]),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
