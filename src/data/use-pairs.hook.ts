import { useQuery } from '@tanstack/react-query'

import { type SimplifiedLog, useFactoryPoolCreated } from './uniswapv3-factory'

const filterPairs = async (
  createdPools: SimplifiedLog[],
): Promise<SimplifiedLog[]> => {
  // for each pool, fetch the pair data from dexscreener
  // if the pair data is not found, remove the pool from the list
  // cache dexscreener data for 10 minutes

  return createdPools
}

export const usePairs = () => {
  const { data: pools } = useFactoryPoolCreated()

  return useQuery({
    queryKey: ['filtered-pairs'],
    queryFn: async () => await filterPairs(pools!),
    enabled: pools != null,
  })
}
