import { NewListings } from './components/new-listings'
import { useAccount, useConnect, useNetwork } from 'wagmi'

function App() {
  const { chain } = useNetwork()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  return (
    <main className='flex flex-col mx-auto items-center gap-4'>
      <nav>Navbar here pls</nav>
      <NewListings />
      {chain && (<div>Chain: {chain.id} connected 🟢</div>)}
      <button onClick={() => connect({ connector: connectors[0] })}>Connect {connectors[0].name}</button>
      {isConnected && <div>Connected 🟢</div>}
    </main>
  )
}

export default App
