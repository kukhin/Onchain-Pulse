import { useEffect, useState } from "react";
import { Basename } from "./Basename";

interface LeaderboardItem {
  rank: number;
  name: string;
  score: number;
  address?: `0x${string}`;
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-base-border bg-white/5">
        <h2 className="text-xl font-bold">Top Pulsers</h2>
        <p className="text-sm text-gray-400">The most vibe-aligned builders on Base</p>
      </div>
      <div className="divide-y divide-base-border">
        {data.map((item) => (
          <div key={item.rank} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center font-mono font-bold text-base-blue">{item.rank}</span>
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                {item.address && <Basename address={item.address} className="text-xs text-gray-500" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{item.score}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">Pulses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
