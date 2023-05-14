import { useQuery } from '@tanstack/react-query'
import { type PublicClient } from '@wagmi/core'
import { useBlockNumber, usePublicClient } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import { uniswapV3FactoryABI, uniswapV3FactoryAddress } from '../contracts'

const arbitrumAvgBlockTime = 0.26
const estimateArbitrumBlock = (
  hoursAgo: number,
  currentBlock: bigint,
): bigint => {
  const blocksInOneHour = 3600 / arbitrumAvgBlockTime
  const blocksDelta = Math.floor(hoursAgo * blocksInOneHour)
  return currentBlock - BigInt(blocksDelta)
}

const getEvents = async (client: PublicClient, blockNumber: bigint) => {
  const filter = await client.createContractEventFilter({
    abi: uniswapV3FactoryABI,
    address: uniswapV3FactoryAddress[arbitrum.id],
    eventName: 'PoolCreated',
    fromBlock: estimateArbitrumBlock(24, blockNumber),
  })

  return await client.getFilterLogs({ filter })
}

export const useFactoryPoolCreated = () => {
  const client = usePublicClient()
  const { data: blockNumber } = useBlockNumber()

  return useQuery({
    queryKey: ['factory-pools'],
    queryFn: async () => await getEvents(client, blockNumber!),
    enabled: blockNumber != null,
  })
}
