import type { FullMetrics, TimePoint, YearlyMetric } from "./types";

const TRADING_DAYS = 250;
const RISK_FREE_RATE = 0.02;

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function stdev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function toDailyReturns(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i += 1) {
    out.push(values[i] / values[i - 1] - 1);
  }
  return out;
}

function calcCagr(first: number, last: number, totalDays: number): number {
  if (first <= 0 || last <= 0 || totalDays <= 0) return 0;
  return (last / first) ** (TRADING_DAYS / totalDays) - 1;
}

function calcMaxDrawdown(nav: number[]): number {
  let peak = nav[0];
  let maxDd = 0;
  for (const value of nav) {
    peak = Math.max(peak, value);
    const dd = (peak - value) / peak;
    maxDd = Math.max(maxDd, dd);
  }
  return maxDd;
}

function calcLongestRecoveryDays(nav: number[]): number {
  let peak = nav[0];
  let peakIndex = 0;
  let maxDays = 0;
  for (let i = 1; i < nav.length; i += 1) {
    if (nav[i] >= peak) {
      peak = nav[i];
      peakIndex = i;
    } else {
      maxDays = Math.max(maxDays, i - peakIndex);
    }
  }
  return maxDays;
}

function calcYearly(points: TimePoint[]): YearlyMetric[] {
  const map = new Map<number, TimePoint[]>();
  for (const point of points) {
    const year = Number(point.date.slice(0, 4));
    const arr = map.get(year) ?? [];
    arr.push(point);
    map.set(year, arr);
  }

  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, rows]) => {
      const first = rows[0];
      const last = rows[rows.length - 1];
      const strategyReturn = last.strategyNav / first.strategyNav - 1;
      const benchmarkReturn = last.benchmarkNav / first.benchmarkNav - 1;
      return {
        year,
        strategyReturn,
        benchmarkReturn,
        excessReturn: strategyReturn - benchmarkReturn,
      };
    });
}

export function calculateMetrics(points: TimePoint[]): FullMetrics {
  const strategyNav = points.map((p) => p.strategyNav);
  const benchmarkNav = points.map((p) => p.benchmarkNav);
  const strategyDaily = toDailyReturns(strategyNav);
  const benchmarkDaily = toDailyReturns(benchmarkNav);
  const excessDaily = strategyDaily.map((ret, idx) => ret - benchmarkDaily[idx]);
  const totalDays = points.length - 1;

  const strategyCagr = calcCagr(strategyNav[0], strategyNav[strategyNav.length - 1], totalDays);
  const benchmarkCagr = calcCagr(benchmarkNav[0], benchmarkNav[benchmarkNav.length - 1], totalDays);
  const excessCagr = strategyCagr - benchmarkCagr;

  const strategyDailyMean = strategyDaily.reduce((s, v) => s + v, 0) / strategyDaily.length;
  const excessDailyMean = excessDaily.reduce((s, v) => s + v, 0) / excessDaily.length;
  const annualizedStrategy = strategyDailyMean * TRADING_DAYS;
  const annualizedExcess = excessDailyMean * TRADING_DAYS;
  const excessVol = stdev(excessDaily) * Math.sqrt(TRADING_DAYS);
  const downside = strategyDaily.filter((v) => v < 0);
  const downsideVol = stdev(downside) * Math.sqrt(TRADING_DAYS);

  return {
    totalDays,
    strategyCagr,
    benchmarkCagr,
    excessCagr,
    sharpe: safeDiv(annualizedStrategy - RISK_FREE_RATE, stdev(strategyDaily) * Math.sqrt(TRADING_DAYS)),
    sortino: safeDiv(annualizedStrategy - RISK_FREE_RATE, downsideVol),
    informationRatio: safeDiv(annualizedExcess, excessVol),
    maxDrawdown: calcMaxDrawdown(strategyNav),
    longestRecoveryDays: calcLongestRecoveryDays(strategyNav),
    yearly: calcYearly(points),
  };
}
