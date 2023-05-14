import { MantineProvider } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig } from 'wagmi'

import App from './App.tsx'
import './index.css'
import { config } from './wagmi.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

// persist cache only in client mode, that's good enough for now
const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: 'dark' }}
    >
      <WagmiConfig config={config}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </WagmiConfig>
    </MantineProvider>
  </React.StrictMode>,
)
