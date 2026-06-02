import type { FullMetrics } from "../lib/types";

type MetricsPanelProps = {
  metrics: FullMetrics;
};

function pct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function num(v: number): string {
  return v.toFixed(2);
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  const rows = [
    ["年化绝对收益", pct(metrics.strategyCagr)],
    ["年化超额收益", pct(metrics.excessCagr)],
    ["夏普比率", num(metrics.sharpe)],
    ["索提诺比率", num(metrics.sortino)],
    ["信息比率", num(metrics.informationRatio)],
    ["最大回撤", pct(metrics.maxDrawdown)],
    ["最长创新高天数", `${metrics.longestRecoveryDays} 天`],
  ];

  return (
    <div className="rounded-xl bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">全期汇总指标</h3>
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
            <span className="text-slate-600">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
