import { useCallback } from "react";
import { useAccount, useCapabilities, useSendCalls, useSendTransaction } from "wagmi";
import { encodeFunctionData, stringToHex, type Address, type Abi } from "viem";
import { base } from "wagmi/chains";

// ERC-8021: Builder Code (16 bytes suffix)
// Your specific code: bc_smhxjgjq
const BUILDER_CODE = "bc_smhxjgjq";

/**
 * Converts a builder code string to a simple hex suffix.
 * Testing hypothesis that Base.dev web indexer prefers simple bc_ string matching.
 */
function getBuilderSuffix(code: string): `0x${string}` {
  return stringToHex(code);
}

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
  const { sendTransactionAsync, isPending: isSendTransactionPending } = useSendTransaction();

  const isPending = isSendCallsPending || isSendTransactionPending;

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

      // ERC-8021 16-byte suffix
      const suffix = getBuilderSuffix(BUILDER_CODE);
      const suffixData = suffix.slice(2); // remove 0x

      // Pre-encode data with suffix for both paths to ensure it's always included in calldata
      const calldata = encodeFunctionData({ 
        abi, 
        functionName, 
        args: args || [] 
      });
      const dataWithSuffix = (calldata + suffixData) as `0x${string}`;

      if (hasPaymaster) {
        // Smart Wallet path
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
              url: "https://api.developer.coinbase.com/rpc/v1/base/YOUR_PAYMASTER_URL", 
            },
          },
        });
      } else {
        // Regular wallet path: use sendTransaction with pre-encoded data 
        // to ensure the suffix is exactly what we want and not stripped by the wallet.
        return await sendTransactionAsync({
          to: contractAddress,
          data: dataWithSuffix,
          value: value || 0n,
        });
      }
    },
    [isConnected, hasPaymaster, sendCallsAsync, sendTransactionAsync]
  );

  return { execute, isPending, hasPaymaster };
}
