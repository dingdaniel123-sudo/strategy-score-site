import type { FullMetrics, MetricScores, StrategyScore } from "./types";

type Segment = {
  min: number;
  max: number;
  scoreMin: number;
  scoreMax: number;
};

function linearScore(value: number, segments: Segment[], higherIsBetter = true): number {
  const ordered = higherIsBetter
    ? [...segments].sort((a, b) => a.min - b.min)
    : [...segments].sort((a, b) => b.min - a.min);

  for (const seg of ordered) {
    if (value >= seg.min && value < seg.max) {
      const ratio = (value - seg.min) / (seg.max - seg.min || 1);
      return seg.scoreMin + ratio * (seg.scoreMax - seg.scoreMin);
    }
  }
  if (higherIsBetter) {
    if (value >= ordered[ordered.length - 1].max) return ordered[ordered.length - 1].scoreMax;
    return ordered[0].scoreMin;
  }
  if (value < ordered[ordered.length - 1].max) return ordered[ordered.length - 1].scoreMin;
  return ordered[0].scoreMax;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
}

function toGrade(totalScore: number): StrategyScore["grade"] {
  if (totalScore >= 90) return "S";
  if (totalScore >= 80) return "A";
  if (totalScore >= 70) return "B";
  if (totalScore >= 60) return "C";
  return "D";
}

export function scoreStrategy(metrics: FullMetrics): StrategyScore {
  const detail: MetricScores = {
    absoluteReturn: clampScore(
      linearScore(metrics.strategyCagr, [
        { min: -1, max: 0, scoreMin: 0, scoreMax: 30 },
        { min: 0, max: 0.1, scoreMin: 30, scoreMax: 50 },
        { min: 0.1, max: 0.2, scoreMin: 50, scoreMax: 70 },
        { min: 0.2, max: 0.3, scoreMin: 70, scoreMax: 90 },
        { min: 0.3, max: 10, scoreMin: 90, scoreMax: 100 },
      ]),
    ),
    excessReturn: clampScore(
      linearScore(metrics.excessCagr, [
        { min: -1, max: 0, scoreMin: 0, scoreMax: 32 },
        { min: 0, max: 0.05, scoreMin: 32, scoreMax: 52 },
        { min: 0.05, max: 0.1, scoreMin: 52, scoreMax: 72 },
        { min: 0.1, max: 0.15, scoreMin: 72, scoreMax: 90 },
        { min: 0.15, max: 10, scoreMin: 90, scoreMax: 100 },
      ]),
    ),
    sharpe: clampScore(
      linearScore(metrics.sharpe, [
        { min: -10, max: 0.5, scoreMin: 0, scoreMax: 34 },
        { min: 0.5, max: 1.0, scoreMin: 34, scoreMax: 54 },
        { min: 1.0, max: 1.5, scoreMin: 54, scoreMax: 74 },
        { min: 1.5, max: 2.0, scoreMin: 74, scoreMax: 90 },
        { min: 2.0, max: 10, scoreMin: 90, scoreMax: 100 },
      ]),
    ),
    sortino: clampScore(
      linearScore(metrics.sortino, [
        { min: -10, max: 0.5, scoreMin: 0, scoreMax: 30 },
        { min: 0.5, max: 1.0, scoreMin: 30, scoreMax: 50 },
        { min: 1.0, max: 1.5, scoreMin: 50, scoreMax: 70 },
        { min: 1.5, max: 2.5, scoreMin: 70, scoreMax: 90 },
        { min: 2.5, max: 20, scoreMin: 90, scoreMax: 100 },
      ]),
    ),
    informationRatio: clampScore(
      linearScore(metrics.informationRatio, [
        { min: -10, max: 0.2, scoreMin: 0, scoreMax: 30 },
        { min: 0.2, max: 0.4, scoreMin: 30, scoreMax: 50 },
        { min: 0.4, max: 0.7, scoreMin: 50, scoreMax: 70 },
        { min: 0.7, max: 1.0, scoreMin: 70, scoreMax: 90 },
        { min: 1.0, max: 10, scoreMin: 90, scoreMax: 100 },
      ]),
    ),
    maxDrawdown: clampScore(
      linearScore(
        metrics.maxDrawdown,
        [
          { min: 0, max: 0.05, scoreMin: 90, scoreMax: 100 },
          { min: 0.05, max: 0.1, scoreMin: 70, scoreMax: 90 },
          { min: 0.1, max: 0.15, scoreMin: 50, scoreMax: 70 },
          { min: 0.15, max: 0.25, scoreMin: 25, scoreMax: 50 },
          { min: 0.25, max: 1, scoreMin: 0, scoreMax: 25 },
        ],
        false,
      ),
    ),
    longestRecoveryDays: clampScore(
      linearScore(
        metrics.longestRecoveryDays,
        [
          { min: 0, max: 20, scoreMin: 90, scoreMax: 100 },
          { min: 20, max: 60, scoreMin: 70, scoreMax: 90 },
          { min: 60, max: 120, scoreMin: 50, scoreMax: 70 },
          { min: 120, max: 250, scoreMin: 25, scoreMax: 50 },
          { min: 250, max: 99999, scoreMin: 0, scoreMax: 25 },
        ],
        false,
      ),
    ),
  };

  const totalScore =
    detail.excessReturn * 0.2 +
    detail.sharpe * 0.15 +
    detail.informationRatio * 0.15 +
    detail.maxDrawdown * 0.15 +
    detail.absoluteReturn * 0.15 +
    detail.sortino * 0.1 +
    detail.longestRecoveryDays * 0.1;

  return {
    totalScore: Number(totalScore.toFixed(2)),
    grade: toGrade(totalScore),
    detail,
  };
}
