import { type Address } from "viem";

export interface LeaderboardItem {
  rank: number;
  name: string;
  score: number;
  address?: Address;
}

export interface UserStats {
  pulses: number;
  streak: number;
  lastPulse: string;
}
