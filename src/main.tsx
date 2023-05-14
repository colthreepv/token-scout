import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig } from 'wagmi'

import App from './App.tsx'
import './index.css'
import { config } from './wagmi.ts'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: 'dark' }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <App />
        </WagmiConfig>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
)
