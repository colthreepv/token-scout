import { MantineProvider } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig } from 'wagmi'

import App from './App.tsx'
import './index.css'
import { config } from './wagmi.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 10 * 60, // 10 minutes
    },
  },
})

// persist cache only in client mode, that's good enough for now
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

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
