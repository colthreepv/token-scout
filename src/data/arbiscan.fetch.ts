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

export const getBlockByTimestamp = async (timestamp: number) => {
  const url = `https://api.arbiscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`
  const response = await fetch(url)
  const data = (await response.json()) as BlockByTimestampResponse
  if (data.status !== '1') {
    throw new Error(data.message)
  }

  return data.result
}

const estimateArbitrumBlock = async (hoursAgo: number): Promise<bigint> => {
  const now = Date.now()
  const timeAgo = new Date(now - hoursAgo * 60 * 60 * 1000)
  const timeStamp = Math.floor(timeAgo.getTime() / 1000)
  const stringBlock = await getBlockByTimestamp(timeStamp)
  return BigInt(stringBlock)
}

export const estimateArbitrumBlockCached = createComputation<bigint>(
  async () => await estimateArbitrumBlock(48),
)
