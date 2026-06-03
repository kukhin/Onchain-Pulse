import { useEnsName } from "wagmi";
import { base } from "wagmi/chains";

interface BasenameProps {
  address: `0x${string}`;
  className?: string;
}

export function Basename({ address, className }: BasenameProps) {
  const { data: name, isLoading } = useEnsName({
    address,
    chainId: base.id,
    // Universal Resolver for Base names
    universalResolverAddress: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD",
  });

  const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isLoading) return <span className={className}>...</span>;

  return (
    <span className={className}>
      {name || shorten(address)}
    </span>
  );
}
