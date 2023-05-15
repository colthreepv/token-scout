import { useQuery } from '@tanstack/react-query'
import { type Address, type PublicClient } from '@wagmi/core'
import { useBlockNumber, usePublicClient } from 'wagmi'

import { type ValidChainId, tokenWhitelist } from '@/networks/tokens'

import { uniswapV3FactoryABI, uniswapV3FactoryAddress } from '../contracts'
import { estimateBlock } from './etherscan.fetch'

export interface SimplifiedLog {
  address: Address
  args: {
    token0: Address
    token1: Address
    fee: number
    tickSpacing: number
    pool: Address
  }
  blockHash: string
  blockNumber: number
  logIndex: number
  transactionHash: string
  transactionIndex: number
}

const toSimplifiedLog = (logs: any[]): SimplifiedLog[] => {
  return logs.map((log) => ({
    address: log.address,
    args: log.args,
    blockHash: log.blockHash,
    blockNumber: Number(log.blockNumber as bigint),
    logIndex: Number(log.logIndex as bigint),
    transactionHash: log.transactionHash,
    transactionIndex: Number(log.transactionIndex as bigint),
  }))
}

const CREATED_POOLS_LAST_BLOCK_KEY = 'created-pools-last-block'
const storeLastBlockByChainId = (chainId: number, block: bigint) => {
  const key = `${CREATED_POOLS_LAST_BLOCK_KEY}:${chainId}`
  localStorage.setItem(key, block.toString())
}
const getLastBlockByChainId = (chainId: number): bigint | null => {
  const key = `${CREATED_POOLS_LAST_BLOCK_KEY}:${chainId}`
  const value = localStorage.getItem(key)
  if (value == null) return null
  return BigInt(value)
}

const CREATED_POOLS_LOGS_KEY = 'created-pools-logs'
const storeLogsByChainId = <T>(chainId: number, logs: T[]) => {
  const key = `${CREATED_POOLS_LOGS_KEY}:${chainId}`
  localStorage.setItem(key, JSON.stringify(logs))
}
const getLogsByChainId = <T>(chainId: number): T[] | null => {
  const key = `${CREATED_POOLS_LOGS_KEY}:${chainId}`
  const value = localStorage.getItem(key)
  if (value == null) return null
  return JSON.parse(value)
}

const getEvents = async (
  client: PublicClient,
  currentBlock: bigint,
  chainId: ValidChainId,
) => {
  const lastBlock = getLastBlockByChainId(chainId)
  const fromBlock =
    lastBlock != null ? lastBlock : await estimateBlock[chainId]()

  const filter = await client.createContractEventFilter({
    abi: uniswapV3FactoryABI,
    address: uniswapV3FactoryAddress[chainId],
    eventName: 'PoolCreated',
    fromBlock,
    toBlock: currentBlock,
  })

  const logs = await client.getFilterLogs({ filter })

  // only return WETH pairs
  // FIXME: make this generic for BSC
  const filteredLogs = logs.filter((log) => {
    const whiteList = tokenWhitelist[chainId]
    return (
      whiteList.includes(log.args.token0) || whiteList.includes(log.args.token1)
    )
  })

  const simplifiedLogs = toSimplifiedLog(filteredLogs)
  console.log(`fetched ${simplifiedLogs.length} new logs`, chainId)

  // now join with previously stored logs!
  const storedLogs = getLogsByChainId<SimplifiedLog>(chainId)
  const allLogs =
    storedLogs != null ? [...simplifiedLogs, ...storedLogs] : simplifiedLogs

  // also store all the logs
  storeLogsByChainId(chainId, allLogs)
  // cool. now store currentBlock in localStorage, so we can use it next time
  storeLastBlockByChainId(chainId, currentBlock)

  return {
    logs: allLogs,
    blockNumber: Number(currentBlock),
  }
}

export const useFactoryPoolCreated = (chainId: ValidChainId) => {
  const client = usePublicClient({ chainId })
  const { data: blockNumber } = useBlockNumber({ chainId })

  return useQuery({
    queryKey: ['factory-pools', chainId],
    queryFn: async () => await getEvents(client, blockNumber!, chainId),
    enabled: blockNumber != null,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
