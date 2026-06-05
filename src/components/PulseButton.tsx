import { useState } from "react";
import { useSmartTransaction } from "../hooks/useSmartTransaction";
import { parseEther, type Address } from "viem";
import { Zap, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const PULSE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const PULSE_ABI = [
  {
    type: "function",
    name: "checkIn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

export function PulseButton() {
  const { execute, isPending } = useSmartTransaction();
  const [success, setSuccess] = useState(false);
  const [localCount, setLocalCount] = useState(0); // This should ideally be fetched from contract

  const handlePulse = async () => {
    if (localCount >= 10) return;
    try {
      await execute({
        address: PULSE_CONTRACT_ADDRESS,
        abi: PULSE_ABI,
        functionName: "checkIn",
      });
      setSuccess(true);
      setLocalCount(prev => prev + 1);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Check-in failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Daily Goal</span>
          <span className="text-sm font-mono font-bold dark:text-white">
            {localCount}/10
          </span>
        </div>
        <div className="w-full h-2 bg-base-surface border border-base-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(localCount / 10) * 100}%` }}
            className="h-full bg-base-blue"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePulse}
          disabled={isPending || localCount >= 10}
          className="base-button w-full h-16 flex items-center justify-center gap-2 text-xl font-bold relative overflow-hidden"
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : success ? (
            "CHECKED IN! ✓"
          ) : localCount >= 10 ? (
            "LIMIT REACHED"
          ) : (
            <>
              <Zap className="fill-current" />
              DAILY CHECK-IN
            </>
          )}
        </motion.button>
      </div>
      
      <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center max-w-xs">
        {isPending ? "Syncing with ledger..." : localCount >= 10 ? "Come back tomorrow for more vibes!" : "Boost your streak and ecosystem activity."}
      </p>
    </div>
  );
}
