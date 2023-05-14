import { useQuery } from '@tanstack/react-query'
import { type Address, type PublicClient } from '@wagmi/core'
import { useBlockNumber, usePublicClient } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import { WETH_ADDRESS } from '@/arbitrum'

import { uniswapV3FactoryABI, uniswapV3FactoryAddress } from '../contracts'
import { estimateArbitrumBlockCached } from './arbiscan.fetch'

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

const getEvents = async (client: PublicClient, currentBlock: bigint) => {
  const lastBlock = getLastBlockByChainId(arbitrum.id)
  const fromBlock =
    lastBlock != null ? lastBlock : await estimateArbitrumBlockCached()

  const filter = await client.createContractEventFilter({
    abi: uniswapV3FactoryABI,
    address: uniswapV3FactoryAddress[arbitrum.id],
    eventName: 'PoolCreated',
    fromBlock,
    toBlock: currentBlock,
  })

  const logs = await client.getFilterLogs({ filter })

  // only return WETH pairs
  // FIXME: make this generic for BSC
  const filteredLogs = logs.filter(
    (log) =>
      log.args.token0 === WETH_ADDRESS || log.args.token1 === WETH_ADDRESS,
  )

  const simplifiedLogs = toSimplifiedLog(filteredLogs)
  console.log(`fetched ${simplifiedLogs.length} new logs`)

  // now join with previously stored logs!
  const storedLogs = getLogsByChainId<SimplifiedLog>(arbitrum.id)
  const allLogs =
    storedLogs != null ? [...simplifiedLogs, ...storedLogs] : simplifiedLogs

  // also store all the logs
  storeLogsByChainId(arbitrum.id, allLogs)
  // cool. now store currentBlock in localStorage, so we can use it next time
  storeLastBlockByChainId(arbitrum.id, currentBlock)

  return allLogs
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
