export interface DexPairInfo {
  schemaVersion: string
  pairs: DexPair[] | null
  pair: DexPair | null
}

export interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: DexEToken
  quoteToken: DexEToken
  priceNative: string
  priceUsd: string
  txns: DexTxns
  volume: DexPriceChange
  priceChange: DexPriceChange
  liquidity: DexLiquidity
  fdv: number
  pairCreatedAt: number
}

export interface DexEToken {
  address: string
  name: string
  symbol: string
}

export interface DexLiquidity {
  usd: number
  base: number
  quote: number
}

export interface DexPriceChange {
  h24: number
  h6: number
  h1: number
  m5: number
}

export interface DexTxns {
  h1: DexH1
  h24: DexH1
  h6: DexH1
  m5: DexH1
}

export interface DexH1 {
  buys: number
  sells: number
}
