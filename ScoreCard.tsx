import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { StrategyScore } from "../lib/types";

type ScoreCardProps = {
  score: StrategyScore;
};

export default function ScoreCard({ score }: ScoreCardProps) {
  const radarData = [
    { key: "绝对收益", value: score.detail.absoluteReturn },
    { key: "超额收益", value: score.detail.excessReturn },
    { key: "夏普", value: score.detail.sharpe },
    { key: "索提诺", value: score.detail.sortino },
    { key: "信息比率", value: score.detail.informationRatio },
    { key: "回撤控制", value: score.detail.maxDrawdown },
    { key: "创新高效率", value: score.detail.longestRecoveryDays },
  ];

  return (
    <div className="rounded-xl bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">综合评分</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-700">{score.totalScore}</p>
          <p className="text-sm text-slate-500">评级 {score.grade}</p>
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="key" tick={{ fontSize: 12 }} />
            <Radar dataKey="value" fill="#2563eb" fillOpacity={0.35} stroke="#1d4ed8" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
