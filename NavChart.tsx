import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimePoint } from "../lib/types";

type NavChartProps = {
  points: TimePoint[];
};

export default function NavChart({ points }: NavChartProps) {
  return (
    <div className="h-[320px] rounded-xl bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">策略与基准净值走势</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="strategyNav" name="策略净值" stroke="#2563eb" dot={false} />
          <Line type="monotone" dataKey="benchmarkNav" name="基准净值" stroke="#16a34a" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
