import { useCallback } from "react";
import { useAccount, useCapabilities, useSendCalls, useWriteContract } from "wagmi";
import { encodeFunctionData, type Address, type Abi } from "viem";
import { base } from "wagmi/chains";

// ERC-8021: Builder address suffix (20 bytes)
// Registered on base.dev
const BUILDER_ADDRESS = "0x4BAe828dfd6adC241000502E15e346C24DE69220"; // User's builder address

export function useSmartTransaction() {
  const { address, isConnected } = useAccount();

  // Smart Wallet detection
  const { data: capabilities } = useCapabilities({
    query: { 
      enabled: Boolean(address),
      retry: false 
    },
  });

  const hasPaymaster = Boolean(capabilities?.[base.id]?.paymasterService?.supported);

  const { sendCallsAsync, isPending: isSendCallsPending } = useSendCalls();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const isPending = isSendCallsPending || isWritePending;

  const execute = useCallback(
    async ({
      address: contractAddress,
      abi,
      functionName,
      args,
      value,
    }: {
      address: Address;
      abi: Abi;
      functionName: string;
      args?: any[];
      value?: bigint;
    }) => {
      if (!isConnected) throw new Error("Wallet not connected");

      // Builder suffix for calldata (last 40 hex chars without 0x)
      const suffix = BUILDER_ADDRESS.slice(2).toLowerCase();

      if (hasPaymaster) {
        // Smart Wallet: sendCalls + paymaster + builder suffix
        const calldata = encodeFunctionData({ 
          abi, 
          functionName, 
          args: args || [] 
        });
        const dataWithSuffix = (calldata + suffix) as `0x${string}`;

        return await sendCallsAsync({
          calls: [
            {
              to: contractAddress,
              data: dataWithSuffix,
              value: value || 0n,
            },
          ],
          capabilities: {
            paymasterService: {
              url: "https://api.developer.coinbase.com/rpc/v1/base/YOUR_PAYMASTER_URL", // Mock
            },
          },
        });
      } else {
        // Regular wallet: writeContract + dataSuffix
        return await writeContractAsync({
          address: contractAddress,
          abi,
          functionName,
          args: args as any,
          value,
          dataSuffix: `0x${suffix}`,
        } as any);
      }
    },
    [isConnected, hasPaymaster, sendCallsAsync, writeContractAsync]
  );

  return { execute, isPending, hasPaymaster };
}
