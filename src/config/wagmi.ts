import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "viem";

export const config = getDefaultConfig({
  appName: "Base Pulse",
  projectId: "YOUR_PROJECT_ID", // Users should replace this via env vars if they have one
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
