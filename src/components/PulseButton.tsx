import { useState } from "react";
import { useSmartTransaction } from "../hooks/useSmartTransaction";
import { parseEther, type Address } from "viem";
import { Zap, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const PULSE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const PULSE_ABI = [
  {
    type: "function",
    name: "pulse",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

export function PulseButton() {
  const { execute, isPending } = useSmartTransaction();
  const [success, setSuccess] = useState(false);

  const handlePulse = async () => {
    try {
      await execute({
        address: PULSE_CONTRACT_ADDRESS,
        abi: PULSE_ABI,
        functionName: "pulse",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Pulse failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePulse}
        disabled={isPending}
        className="base-button w-full sm:w-64 h-16 flex items-center justify-center gap-2 text-xl font-bold relative overflow-hidden"
      >
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : success ? (
          "PULSED! ✓"
        ) : (
          <>
            <Zap className="fill-current" />
            PULSE NOW
          </>
        )}
      </motion.button>
      <p className="text-xs text-gray-500 uppercase tracking-widest text-center">
        {isPending ? "Waiting for confirmation..." : "Sends a message to the Base network"}
      </p>
    </div>
  );
}
