export type BenchmarkKey = "wind_all_a" | "shanghai" | "csi300" | "csi500";

export type TimePoint = {
  date: string;
  strategyNav: number;
  benchmarkNav: number;
};

export type YearlyMetric = {
  year: number;
  strategyReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
};

export type FullMetrics = {
  totalDays: number;
  strategyCagr: number;
  benchmarkCagr: number;
  excessCagr: number;
  sharpe: number;
  sortino: number;
  informationRatio: number;
  maxDrawdown: number;
  longestRecoveryDays: number;
  yearly: YearlyMetric[];
};

export type MetricScores = {
  absoluteReturn: number;
  excessReturn: number;
  sharpe: number;
  sortino: number;
  informationRatio: number;
  maxDrawdown: number;
  longestRecoveryDays: number;
};

export type StrategyScore = {
  totalScore: number;
  grade: "S" | "A" | "B" | "C" | "D";
  detail: MetricScores;
};
