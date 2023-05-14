import { useQuery } from '@tanstack/react-query'
import { type PublicClient } from '@wagmi/core'
import { useBlockNumber, usePublicClient } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import { WETH_ADDRESS } from '@/arbitrum'

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
    fromBlock: estimateArbitrumBlock(48, blockNumber),
  })

  const logs = await client.getFilterLogs({ filter })

  // only return WETH pairs
  const filteredLogs = logs.filter(
    (log) =>
      log.args.token0 === WETH_ADDRESS || log.args.token1 === WETH_ADDRESS,
  )
  return filteredLogs
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
