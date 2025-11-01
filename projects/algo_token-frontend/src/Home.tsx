import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import ASACreator from './components/ASACreator'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openASACreator, setOpenASACreator] = useState(false)
  const { activeAddress, activeWallet } = useWallet()
  const networkInfo = 'TestNet'

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)
  const toggleASACreator = () => setOpenASACreator(!openASACreator)
  const handleDisconnect = async () => {
    if (activeWallet) await activeWallet.disconnect()
  }

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-6)}`

  // 🌌 Landing Page (Not Connected)
  if (!activeAddress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white px-6">
        {/* Floating Gradients with Unique Patterns */ }
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-full mix-blend-multiply blur-3xl opacity-25 animate-pulse delay-700" />
          {/* Unique Geometric Patterns */}
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg rotate-45 opacity-10 animate-bounce" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-15 animate-ping" />
          <div className="absolute top-1/3 right-1/2 w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 transform rotate-12 opacity-20 animate-spin" />
          <div className="absolute top-1/6 left-1/6 w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full opacity-12 animate-pulse delay-300" />
        </div>

        {/* Main Container */}
        <div className="max-w-3xl text-center backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl border-opacity-20">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-500 border border-white/20">
              <span className="text-4xl">⚡</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent font-black">
              ASA Token Creator
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl font-medium">
              Create your own Algorand Standard Assets (ASAs) in seconds.
              No coding required — just connect your wallet and deploy.
            </p>

            {/* CTA Button */}
            <button
              onClick={toggleWalletModal}
              className="mt-6 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-400 border border-white/20 font-bold"
              aria-label="Launch ASA Creator"
            >
              🚀 Launch Creator
            </button>

            <p className="text-slate-400 text-sm font-medium">
              Connected Network: <span className="text-violet-300 font-semibold">{networkInfo}</span>
            </p>
          </div>
        </div>

        {/* Wallet Modal */}
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    )
  }

  // 💠 Dashboard (Connected)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950 flex flex-col items-center py-10 relative overflow-hidden text-white">
      {/* Background Overlay with Unique Patterns */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 to-purple-900/20 blur-3xl -z-10" />
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg rotate-45 opacity-25 animate-bounce" />
      <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-br from-fuchsia-600 to-pink-700 rounded-full opacity-20 animate-ping delay-500" />

      {/* Main Container */}
      <div className="container max-w-5xl backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 border-b pb-4 border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 border border-white/20">
              <span className="text-white text-lg">🪙</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-white font-semibold">ASA Creator</h1>
              <p className="text-sm text-slate-300 font-medium">{networkInfo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-mono border border-white/20">
              {formatAddress(activeAddress)}
            </div>
            <button
              onClick={handleDisconnect}
              className="text-sm px-4 py-2 bg-red-900/50 text-white border border-red-700 rounded-lg hover:bg-red-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              aria-label="Disconnect Wallet"
            >
              🚪 Disconnect
            </button>
          </div>
        </header>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-white font-black">
            Create Your ASA Token
          </h2>
          <p className="text-slate-300 mt-3 font-medium">
            Design, configure, and deploy your token on the Algorand TestNet
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { icon: '💰', label: 'Network Fee', value: '~0.1 ALGO' },
            { icon: '⚡', label: 'Deployment Time', value: '~4 sec' },
            { icon: '🔒', label: 'Security', value: 'Enterprise' },
            { icon: '🌐', label: 'Network', value: 'TestNet' },
          ].map((item, index) => (
            <div
              key={item.label}
              className="p-5 rounded-2xl shadow-sm border border-white/20 text-center relative overflow-hidden hover:shadow-lg hover:border-violet-300 transition-all duration-300 group"
            >
              <div className="text-3xl mb-2 group-hover:animate-pulse">
                {item.icon}
              </div>
              <p className="text-white font-semibold">{item.value}</p>
              <p className="text-sm text-slate-300 font-medium">{item.label}</p>
              {/* Unique Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Create Button */}
        <div className="text-center mb-10">
          <button
            onClick={toggleASACreator}
            className="px-12 py-5 text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 rounded-2xl shadow-lg hover:shadow-violet-300/30 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-400 border border-white/20 font-bold"
            aria-label="Create New ASA Token"
          >
            🪙 Create New ASA
          </button>
          <p className="text-slate-300 mt-3 text-sm font-medium">
            Instantly deploy tokens with just one click
          </p>
        </div>

        {/* Status Panel */}
        <div className="border border-white/20 rounded-2xl py-6 text-center hover:shadow-md transition-shadow duration-300">
          <div className="inline-flex items-center space-x-4">
            <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center shadow-lg animate-spin border border-white/20">
              <span className="text-white text-lg">✓</span>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white font-bold">TestNet Active</h4>
              <p className="text-sm text-slate-300 font-medium">Ready for ASA deployment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ASA Modal */}
      <ASACreator openModal={openASACreator} setModalState={setOpenASACreator} />
    </div>
  )
}

export default Home
