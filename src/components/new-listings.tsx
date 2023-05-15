import { Anchor, Skeleton, Text, Tooltip } from '@mantine/core'
import { format } from 'numerable'
import { type FC } from 'react'
import { type Address, useToken } from 'wagmi'
import { arbitrum, bsc } from 'wagmi/chains'

import dexScreener from '@/assets/dexscreener.svg'
import { uiExplorer } from '@/data/etherscan.fetch'
import { useFactoryPoolCreated } from '@/data/uniswapv3-factory'
import { usePairInfo } from '@/data/use-pair-info.hook'
import { type ValidChainId } from '@/networks/tokens'
import { timestampAgo } from '@/utils/numers.util'

const TokenElement: FC<{ address: Address; chainId: ValidChainId }> = ({
  address,
  chainId,
}) => {
  const { data, isLoading } = useToken({
    address,
    chainId,
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

const chainIcons = new Map<number, string>([
  [arbitrum.id, 'https://dd.dexscreener.com/ds-data/chains/arbitrum.png'],
  [bsc.id, 'https://dd.dexscreener.com/ds-data/chains/bsc.png'],
])

interface PoolElementProps {
  fee: number
  pool: Address
  tickSpacing: number
  token0: Address
  token1: Address

  chainId: ValidChainId
  blockNumber: number | null
}

const LIQUIDITY_THRESHOLD = 5_000

const PoolElement: FC<PoolElementProps> = ({
  pool,
  token0,
  token1,
  chainId,
}) => {
  const { data: dataPair, isLoading: isLoadingPair } = usePairInfo(
    pool,
    chainId,
  )

  if (isLoadingPair) {
    return <Skeleton width="160px" height="80px" radius="sm" />
  }

  if (dataPair != null && dataPair.pair == null) return null
  if (
    dataPair?.pair?.liquidity?.usd != null &&
    dataPair?.pair?.liquidity?.usd < LIQUIDITY_THRESHOLD
  )
    return null

  const { distanceToNow, absoluteDate } = timestampAgo(
    dataPair?.pair?.pairCreatedAt,
  )

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-600 rounded-md">
      <Text fz="md" className="flex flex-row justify-center flex-shrink gap-2">
        <TokenElement address={token0} chainId={chainId} />
        <span>/</span>
        <TokenElement address={token1} chainId={chainId} />
      </Text>

      <div className="flex flex-row gap-2">
        <Anchor href={uiExplorer(chainId, pool)} target="_blank">
          <img src={dexScreener} width="24" height="24" />
        </Anchor>
        {dataPair != null && (
          <div>Liquidity: {format(dataPair.pair?.liquidity.usd, '0.00a')}</div>
        )}
      </div>

      {chainId != null && (
        <div className="flex justify-between">
          {dataPair?.pair?.pairCreatedAt != null && (
            <Tooltip label={absoluteDate}>
              <Text fz="sm">{distanceToNow}</Text>
            </Tooltip>
          )}
          <img src={chainIcons.get(chainId)} height="24px" width="24px" />
        </div>
      )}
    </div>
  )
}

export const NewListings = () => {
  const {
    data: arbitrumData,
    isLoading: isLoadingArbitrum,
    isFetched: isFetchedArbitrum,
  } = useFactoryPoolCreated(arbitrum.id)

  const {
    data: bscData,
    isLoading: isLoadingBsc,
    isFetched: isFetchedBsc,
  } = useFactoryPoolCreated(bsc.id)

  const isLoading = isLoadingBsc || isLoadingArbitrum

  return (
    <div className="grid grid-cols-2 gap-3 place-content-around lg:grid-cols-5 md:grid-cols-3">
      {isLoading && (
        <>
          <Skeleton width="160px" height="80px" radius="sm" />
          <Skeleton width="160px" height="80px" radius="sm" />
          <Skeleton width="160px" height="80px" radius="sm" />
          <Skeleton width="160px" height="80px" radius="sm" />
          <Skeleton width="160px" height="80px" radius="sm" />
        </>
      )}
      {isFetchedArbitrum &&
        arbitrumData!.logs.map((pool) => (
          <PoolElement
            {...pool.args}
            blockNumber={pool.blockNumber}
            chainId={arbitrum.id}
            key={pool.transactionHash}
          />
        ))}
      {isFetchedBsc &&
        bscData!.logs.map((pool) => (
          <PoolElement
            {...pool.args}
            blockNumber={pool.blockNumber}
            chainId={bsc.id}
            key={pool.transactionHash}
          />
        ))}
    </div>
  )
}
