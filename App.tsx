import { useEffect, useMemo, useState } from "react";
import BenchmarkSelect from "./components/BenchmarkSelect";
import MetricsPanel from "./components/MetricsPanel";
import NavChart from "./components/NavChart";
import ScoreCard from "./components/ScoreCard";
import UploadZone from "./components/UploadZone";
import YearlyTable from "./components/YearlyTable";
import { calculateMetrics } from "./lib/metrics";
import { alignSeries, loadBenchmarkSeries, parseStrategyCsv } from "./lib/parser";
import { scoreStrategy } from "./lib/scoring";
import type { BenchmarkKey, FullMetrics, StrategyScore, TimePoint } from "./lib/types";

type AppState = {
  points: TimePoint[];
  metrics: FullMetrics | null;
  score: StrategyScore | null;
};

function App() {
  const [benchmark, setBenchmark] = useState<BenchmarkKey>("wind_all_a");
  const [strategyCsv, setStrategyCsv] = useState<string>("");
  const [state, setState] = useState<AppState>({
    points: [],
    metrics: null,
    score: null,
  });
  const [error, setError] = useState<string>("");

  const dateRange = useMemo(() => {
    if (state.points.length === 0) return "-";
    return `${state.points[0].date} ~ ${state.points[state.points.length - 1].date}`;
  }, [state.points]);

  const onUpload = async (file: File) => {
    try {
      setError("");
      const content = await file.text();
      setStrategyCsv(content);
      const strategySeries = parseStrategyCsv(content);
      const benchmarkSeries = await loadBenchmarkSeries(benchmark);
      const points = alignSeries(strategySeries, benchmarkSeries);
      const metrics = calculateMetrics(points);
      const score = scoreStrategy(metrics);
      setState({ points, metrics, score });
    } catch (e) {
      setError(e instanceof Error ? e.message : "处理失败，请检查文件格式。");
      setState({ points: [], metrics: null, score: null });
    }
  };

  useEffect(() => {
    if (!strategyCsv) return;
    let cancelled = false;
    (async () => {
      try {
        const strategySeries = parseStrategyCsv(strategyCsv);
        const benchmarkSeries = await loadBenchmarkSeries(benchmark);
        const points = alignSeries(strategySeries, benchmarkSeries);
        const metrics = calculateMetrics(points);
        const score = scoreStrategy(metrics);
        if (!cancelled) {
          setError("");
          setState({ points, metrics, score });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "基准切换后计算失败。");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [benchmark, strategyCsv]);

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl bg-white p-5">
        <h1 className="text-xl font-bold text-slate-900">股票策略评分网站</h1>
        <p className="mt-2 text-sm text-slate-600">
          上传策略净值 CSV，系统自动对齐交易日并与基准比较，输出年度表现、风险收益指标和综合评分。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UploadZone onUpload={onUpload} />
        <div className="space-y-3">
          <BenchmarkSelect selected={benchmark} onChange={setBenchmark} />
          <div className="rounded-xl bg-white p-4 text-sm text-slate-600">
            对齐日期范围：<span className="font-medium text-slate-900">{dateRange}</span>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {state.metrics && state.score && (
        <>
          <NavChart points={state.points} />
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <YearlyTable yearly={state.metrics.yearly} />
            <MetricsPanel metrics={state.metrics} />
          </section>
          <ScoreCard score={state.score} />
        </>
      )}
    </main>
  );
}

export default App;
