import { useEffect, useState } from "react";
import { WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, ConnectButton, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { config } from "./config/wagmi";
import { Leaderboard } from "./components/Leaderboard";
import { PulseButton } from "./components/PulseButton";
import { Basename } from "./components/Basename";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldCheck, Gamepad2, Info, Moon, Sun } from "lucide-react";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function MainContent({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Farcaster Mini App ready signal
    import("@farcaster/miniapp-sdk").then(({ sdk }) => {
      sdk.actions.ready().catch(console.error);
    }).catch(() => {
      // Not in mini app context
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto space-y-12 transition-colors duration-300">
      {/* Header */}
      <header className="w-full flex justify-between items-center bg-base-surface/30 p-4 rounded-3xl backdrop-blur-sm border border-base-border">
        <div className="flex items-center gap-2">
          <div className="bg-base-blue p-2 rounded-xl">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight dark:text-white text-base-dark">BASE PULSE</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-base-surface border border-base-border hover:bg-base-blue/10 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} className="text-base-dark" />}
          </button>
          <ConnectButton 
            accountStatus="avatar" 
            showBalance={false}
            chainStatus="icon"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base-blue/10 border border-base-blue/20 text-base-blue text-xs font-bold tracking-wider uppercase">
            <ShieldCheck size={14} />
            Verified on Base
          </div>
          <h2 className="text-5xl sm:text-6xl font-display font-bold leading-tight">
            Vibe harder. <br/>
            <span className="text-base-blue">Live on-chain.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            The simplest way to build your on-chain streak. One tap a day keeps the degen away.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              <PulseButton />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Active as:</span>
                <Basename address={address!} className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-base-surface/50 border border-base-border p-6 rounded-3xl"
            >
              <p className="text-sm text-gray-400 mb-4">Connect your wallet to start pulsing.</p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Stats Divider */}
      <div className="w-full grid grid-cols-2 gap-4">
        <div className="glass-card p-6 flex flex-col gap-1 items-center justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Pulses</span>
          <span className="text-3xl font-display font-bold">1.2M+</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-1 items-center justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Active Builders</span>
          <span className="text-3xl font-display font-bold">12,394</span>
        </div>
      </div>

      {/* Leaderboard Section */}
      <section className="w-full space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Gamepad2 size={20} className="text-base-blue" />
          <h3 className="text-xl font-bold">Leaderboard</h3>
        </div>
        <Leaderboard />
      </section>

      {/* Info Section */}
      <section className="w-full glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-base-blue" />
          <h4 className="font-bold">What is Base Pulse?</h4>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Base Pulse is a minimal proof-of-vibe experiment. Every "pulse" is a transaction on the Base network that verifies your active participation in the ecosystem. 
          It utilizes <span className="text-white font-medium">Smart Wallets</span> for gasless interactions where possible and <span className="text-white font-medium">ERC-8021</span> for builder attribution.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-gray-600 border-t border-base-border">
        <p>© 2026 Base Pulse • Build On Base</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={(isDark ? darkTheme : lightTheme)({
            accentColor: '#0052FF',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          <MainContent isDark={isDark} setIsDark={setIsDark} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

