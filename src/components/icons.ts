import { arbitrum, bsc } from 'wagmi/chains'

export const chainIcons = new Map<number, string>([
  [arbitrum.id, 'https://dd.dexscreener.com/ds-data/chains/arbitrum.png'],
  [bsc.id, 'https://dd.dexscreener.com/ds-data/chains/bsc.png'],
])
