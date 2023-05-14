import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider } from '@mantine/core'

import { WagmiConfig } from 'wagmi'

import './index.css'
import { config } from './wagmi.ts'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
      <WagmiConfig config={config}>
        <App />
      </WagmiConfig>
    </MantineProvider>
  </React.StrictMode>,
)
