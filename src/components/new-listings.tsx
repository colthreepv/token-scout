import { Anchor, Skeleton, Text } from '@mantine/core'
import { format } from 'numerable'
import { type FC } from 'react'
import { type Address, useToken } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import dexScreener from '@/assets/dexscreener.svg'
import { useFactoryPoolCreated } from '@/data/uniswapv3-factory'
import { usePairInfo } from '@/data/use-pair-info.hook'

const TokenElement: FC<{ address: Address }> = ({ address }) => {
  const { data, isLoading } = useToken({
    address,
    chainId: arbitrum.id,
  })
  return (
    <>
      {isLoading && <Skeleton height="24px" width="32px" radius="sm" />}
      {data != null && (
        <Anchor
          href={`https://arbiscan.io/token/${data.address}`}
          target="_blank"
        >
          {data.symbol}
        </Anchor>
      )}
    </>
  )
}

interface PoolElementProps {
  fee: number
  pool: Address
  tickSpacing: number
  token0: Address
  token1: Address
  blockNumber: number | null
}

const LIQUIDITY_THRESHOLD = 5_000

const PoolElement: FC<PoolElementProps> = ({ pool, token0, token1 }) => {
  const { data: dataPair, isLoading: isLoadingPair } = usePairInfo(pool)

  if (isLoadingPair) {
    return <Skeleton width="160px" height="80px" radius="sm" />
  }

  if (dataPair != null && dataPair.pair == null) return null
  if (
    dataPair?.pair?.liquidity?.usd != null &&
    dataPair?.pair?.liquidity?.usd < LIQUIDITY_THRESHOLD
  )
    return null

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-600 rounded-md">
      <Text fz="md" className="flex flex-row justify-center flex-shrink gap-2">
        <TokenElement address={token0} />
        <span>/</span>
        <TokenElement address={token1} />
      </Text>

      <div className="flex flex-row gap-2">
        <Anchor
          href={`https://dexscreener.com/arbitrum/${pool}`}
          target="_blank"
        >
          <img src={dexScreener} width="24" height="24" />
        </Anchor>
        {dataPair != null && (
          <div>Liquidity: {format(dataPair.pair?.liquidity.usd, '0.00a')}</div>
        )}
      </div>
    </div>
  )
}

interface NewListingsProps {}

export const NewListings = () => {
  const { data, isLoading, isFetched } = useFactoryPoolCreated()

  return (
    <div className="grid grid-cols-2 gap-3 place-content-around lg:grid-cols-5 md:grid-cols-3">
      {isLoading && <Skeleton height="280px" width="320px" radius="sm" />}
      {isFetched &&
        data!.logs.map((pool) => (
          <PoolElement
            {...pool.args}
            blockNumber={pool.blockNumber}
            key={pool.transactionHash}
          />
        ))}
    </div>
  )
}
