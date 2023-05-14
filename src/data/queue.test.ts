import PQueue from 'p-queue'

// etherscan rate limit is 5 requests per second
const queue = new PQueue({ intervalCap: 1, interval: 5000 })

const fetchDataWithCache = async <T>(
  operation: string,
  uniqueKey: string,
  fetchFn: () => Promise<T>,
): Promise<T> => {
  const localStorageKey = `arbiscan:${operation}:${uniqueKey}`
  const storedData = localStorage.getItem(localStorageKey)

  if (storedData != null) {
    return JSON.parse(storedData)
  }

  const data = await queue.add(fetchFn, { throwOnTimeout: true })
  localStorage.setItem(localStorageKey, JSON.stringify(data))
  return data
}
