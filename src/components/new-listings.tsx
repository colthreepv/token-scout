import { Anchor, Skeleton, Text } from '@mantine/core'
import { type FC } from 'react'
import { type Address, useToken } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import dexScreener from '@/assets/dexscreener.svg'
import { useFactoryPoolCreated } from '@/data/uniswapv3-factory'

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
  blockNumber: bigint | null
}

const PoolElement: FC<PoolElementProps> = ({ pool, token0, token1 }) => {
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
        <div>Mktcap</div>
      </div>
    </div>
  )
}

interface NewListingsProps {}

export const NewListings = () => {
  // useUniswapV3FactoryPoolCreatedEvent({
  //   listener: (event) => {
  //     console.log(event)
  //   },
  //   chainId: arbitrum.id,
  // })

  const { data, isLoading, isFetched } = useFactoryPoolCreated()
  console.log({ data })

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 md:grid-cols-3">
      {isFetched &&
        data!.map((pool) => (
          <div key={pool.transactionHash}>
            <PoolElement {...pool.args} blockNumber={pool.blockNumber} />
          </div>
        ))}
    </div>
  )
}
