import { useCallback } from "react";
import { useAccount, useCapabilities, useSendCalls, useWriteContract } from "wagmi";
import { encodeFunctionData, stringToHex, type Address, type Abi } from "viem";
import { base } from "wagmi/chains";

// ERC-8021: Builder Code (16 bytes suffix)
// Your specific code: bc_smhxjgjq
const BUILDER_CODE = "bc_smhxjgjq";

/**
 * Converts a builder code string to a 16-byte hex suffix (ERC-8021)
 */
function getBuilderSuffix(code: string): `0x${string}` {
  // Encodes the string to hex and right-pads with zeros to exactly 16 bytes
  return stringToHex(code, { size: 16 });
}

export function useSmartTransaction() {
  const { address, isConnected } = useAccount();

  // Smart Wallet detectionф
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

      if (hasPaymaster) {
        // Smart Wallet: sendCalls + paymaster + 16-byte builder code suffix
        const calldata = encodeFunctionData({ 
          abi, 
          functionName, 
          args: args || [] 
        });
        const dataWithSuffix = (calldata + suffixData) as `0x${string}`;

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
              // Note: In a real app, this would be your Paymaster URL from Coinbase Developer Platform
              url: "https://api.developer.coinbase.com/rpc/v1/base/YOUR_PAYMASTER_URL", 
            },
          },
        });
      } else {
        // Regular wallet: writeContract + ERC-8021 dataSuffix
        return await writeContractAsync({
          address: contractAddress,
          abi,
          functionName,
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
