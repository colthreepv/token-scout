import { arbitrum, bsc } from 'wagmi/chains'

import { type ValidChainId } from '@/networks/tokens'

interface BlockByTimestampResponse {
  status: string
  message: string
  result: string
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
  async () => await internalEstimateBlock(48, bsc.id),
)

export const estimateBlock: Record<ValidChainId, () => Promise<bigint>> = {
  [arbitrum.id]: estimateArbitrumBlockCached,
  [bsc.id]: estimateBscBlockCached,
}
