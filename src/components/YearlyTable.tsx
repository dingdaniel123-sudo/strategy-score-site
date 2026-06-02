import type { YearlyMetric } from "../lib/types";

type YearlyTableProps = {
  yearly: YearlyMetric[];
};

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export default function YearlyTable({ yearly }: YearlyTableProps) {
  return (
    <div className="rounded-xl bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">分年度表现</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">年份</th>
              <th className="py-2">绝对收益</th>
              <th className="py-2">基准收益</th>
              <th className="py-2">超额收益</th>
            </tr>
          </thead>
          <tbody>
            {yearly.map((item) => (
              <tr key={item.year} className="border-b border-slate-100">
                <td className="py-2">{item.year}</td>
                <td className="py-2">{pct(item.strategyReturn)}</td>
                <td className="py-2">{pct(item.benchmarkReturn)}</td>
                <td className="py-2">{pct(item.excessReturn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
