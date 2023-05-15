import { Skeleton, Text, Tooltip } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { arbitrum, bsc } from 'wagmi/chains'

import { getBlockRewardsByBlock } from '@/data/etherscan.fetch'
import {
  getLastBlockByChainId,
  useFactoryPoolCreated,
} from '@/data/uniswapv3-factory'
import { type ValidChainId } from '@/networks/tokens'
import { timestampAgo } from '@/utils/numbers.util'

import { chainIcons } from './icons'

const useLastFactoryFetch = (chainId: ValidChainId) => {
  const { isSuccess } = useFactoryPoolCreated(chainId)

  return useQuery({
    queryKey: ['last-factory-fetch', chainId],
    queryFn: async () => {
      const lastBlock = getLastBlockByChainId(chainId)
      if (lastBlock == null) throw new Error('Not fetched yet')
      const timestamp = await getBlockRewardsByBlock(lastBlock, chainId)

      return {
        lastBlock,
        timestamp,
      }
    },
    enabled: isSuccess,
  })
}

export const Navbar = () => {
  const { data: lastFetchBsc, isLoading: isLoadingBsc } = useLastFactoryFetch(
    bsc.id,
  )
  const { data: lastFetchArb, isLoading: isLoadingArb } = useLastFactoryFetch(
    arbitrum.id,
  )

  const { distanceToNow: distanceBsc } = timestampAgo(lastFetchBsc?.timestamp)
  const { distanceToNow: distanceArb } = timestampAgo(lastFetchArb?.timestamp)

  return (
    <nav className="flex items-center justify-center w-full gap-4 px-4 py-2 border-b border-b-slate-500">
      <Text fz="lg">Pools fetched:</Text>
      <div className="flex gap-1 p-1 border border-gray-600 rounded-md">
        <img src={chainIcons.get(bsc.id)} height={20} width={20} />
        {isLoadingBsc && <Skeleton height={16} width={40} />}
        {lastFetchBsc != null && (
          <Tooltip label={Number(lastFetchBsc.lastBlock)}>
            <Text fz="sm">{distanceBsc}</Text>
          </Tooltip>
        )}
      </div>

      <div className="flex gap-1 p-1 border border-gray-600 rounded-md">
        <img src={chainIcons.get(arbitrum.id)} height={20} width={20} />
        {isLoadingArb && <Skeleton height={16} width={40} />}
        {lastFetchArb != null && (
          <Tooltip label={Number(lastFetchArb.lastBlock)}>
            <Text fz="sm">{distanceArb}</Text>
          </Tooltip>
        )}
      </div>
    </nav>
  )
}
