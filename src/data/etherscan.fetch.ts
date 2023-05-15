import { arbitrum, bsc } from 'wagmi/chains'

import { type ValidChainId } from '@/networks/tokens'

interface BlockByTimestampResponse {
  status: string
  message: string
  result: string
}

interface BlockRewardsByBlockResponse {
  status: string
  message: string
  result: {
    blockNumber: string
    timeStamp: string
    blockMiner: string
    blockReward: string
    uncles: any[]
    uncleInclusionReward: string
  }
}

const createComputation = <T>(fn: () => Promise<T>) => {
  let promise: Promise<T> | null = null

  return async (): Promise<T> => {
    if (promise === null) {
      // Start the computation
      promise = fn()

      // Wait for the computation to finish
      const result = await promise
      return result
    } else {
      // Return the result of the computation
      return await promise
    }
  }
}

const urlsByChainId = new Map<ValidChainId, string>([
  [arbitrum.id, 'https://api.arbiscan.io/api'],
  [bsc.id, 'https://api.bscscan.com/api'],
])

export const getBlockByTimestamp = async (
  timestamp: number,
  chainId: ValidChainId,
) => {
  const baseUrl = urlsByChainId.get(chainId)!
  const url = `${baseUrl}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`
  const response = await fetch(url)
  const data = (await response.json()) as BlockByTimestampResponse
  if (data.status !== '1') {
    throw new Error(data.message)
  }

  return data.result
}

export const getBlockRewardsByBlock = async (
  blockNumber: bigint,
  chainId: ValidChainId,
) => {
  const baseUrl = urlsByChainId.get(chainId)!
  const url = `${baseUrl}?module=block&action=getblockreward&blockno=${blockNumber}`
  const response = await fetch(url)
  const data = (await response.json()) as BlockRewardsByBlockResponse
  if (data.status !== '1') {
    throw new Error(data.message)
  }
  if (data.result.timeStamp == null) {
    throw new Error('Missing timestamp')
  }

  return Number(data.result.timeStamp)
}

const prefixByChainId = new Map<ValidChainId, string>([
  [arbitrum.id, 'arbitrum'],
  [bsc.id, 'bsc'],
])

export const uiExplorer = (chainId: ValidChainId, pool: string) => {
  return `https://dexscreener.com/${prefixByChainId.get(chainId)!}/${pool}`
}

const internalEstimateBlock = async (
  hoursAgo: number,
  chainId: ValidChainId,
): Promise<bigint> => {
  const now = Date.now()
  const timeAgo = new Date(now - hoursAgo * 60 * 60 * 1000)
  const timeStamp = Math.floor(timeAgo.getTime() / 1000)
  const stringBlock = await getBlockByTimestamp(timeStamp, chainId)
  return BigInt(stringBlock)
}

const estimateArbitrumBlockCached = createComputation<bigint>(
  async () => await internalEstimateBlock(48, arbitrum.id),
)

const estimateBscBlockCached = createComputation<bigint>(
  async () => await internalEstimateBlock(24, bsc.id),
)

export const estimateBlock: Record<ValidChainId, () => Promise<bigint>> = {
  [arbitrum.id]: estimateArbitrumBlockCached,
  [bsc.id]: estimateBscBlockCached,
}
