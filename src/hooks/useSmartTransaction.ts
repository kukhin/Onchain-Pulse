import { useCallback } from "react";
import { useAccount, useCapabilities, useSendCalls, useWriteContract } from "wagmi";
import { encodeFunctionData, stringToHex, type Address, type Abi } from "viem";
import { base } from "wagmi/chains";

// ERC-8021: Builder Code (16 bytes suffix)
// Your specific code: bc_smhxjgjq
const BUILDER_CODE = "bc_smhxjgjq";

/**
 * Converts a builder code string to an ERC-8021 data suffix
 * Format: [length (1 byte)] [code (ASCII)] [null separator (1 byte)] [16 bytes of 8021 marker]
 */
function getBuilderSuffix(code: string): `0x${string}` {
  const lengthHex = code.length.toString(16).padStart(2, '0');
  // convert string to hex (removes 0x)
  const codeHex = stringToHex(code).slice(2);
  const nullSeparator = "00";
  // 16 bytes of 8021 (8 repeats) - standard ERC-8021 marker
  const marker = "80218021802180218021802180218021";
  
  return `0x${lengthHex}${codeHex}${nullSeparator}${marker}` as `0x${string}`;
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
        // Regular wallet path: manual data construction to bypass any provider stripping of dataSuffix
        return await writeContractAsync({
          address: contractAddress,
          abi,
          functionName,
          // We pass the data directly here if writeContract allows it, 
          // but usually we need to pass args and let it encode. 
          // If we want manual data, we use sendTransaction.
          // Let's stick to using dataSuffix for writeContract but also provide args.
          args: args as any,
          value,
          dataSuffix: suffix,
        } as any);
      }
    },
    [isConnected, hasPaymaster, sendCallsAsync, writeContractAsync]
  );

  return { execute, isPending, hasPaymaster };
}
