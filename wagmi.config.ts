import { defineConfig } from '@wagmi/cli'
import { etherscan, react } from '@wagmi/cli/plugins'
import { arbitrum } from 'viem/chains'
import 'dotenv/config'

export default defineConfig({
  out: 'src/contracts.ts',
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: arbitrum.id,
      contracts: [
        {
          name: 'UniswapV3Factory',
          address: {
            [arbitrum.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          },
        },
      ],
    }),
    react(),
  ],
})
