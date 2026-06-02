import type { BenchmarkKey } from "../lib/types";

type BenchmarkSelectProps = {
  selected: BenchmarkKey;
  onChange: (key: BenchmarkKey) => void;
};

const options: { key: BenchmarkKey; label: string }[] = [
  { key: "wind_all_a", label: "万得全A" },
  { key: "shanghai", label: "上证指数" },
  { key: "csi300", label: "沪深300" },
  { key: "csi500", label: "中证500" },
];

export default function BenchmarkSelect({ selected, onChange }: BenchmarkSelectProps) {
  return (
    <div className="rounded-xl bg-white p-5">
      <p className="mb-3 text-sm text-slate-500">选择对比基准</p>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`rounded-lg px-3 py-2 text-sm ${
              selected === item.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
