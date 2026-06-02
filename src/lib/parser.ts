import Papa from "papaparse";
import type { BenchmarkKey, TimePoint } from "./types";

type RawRow = Record<string, string | number | undefined>;
type BenchmarkPayload = {
  _meta?: Record<string, unknown>;
  data: Record<string, number>;
};

const DATE_HEADERS = ["date", "日期", "trade_date", "tradedate"];
const NAV_HEADERS = ["nav", "净值", "value", "strategy_nav"];

function normalizeDate(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(raw)) {
    return raw.replaceAll("/", "-");
  }
  return null;
}

function guessKey(row: RawRow, candidates: string[]): string | null {
  const keys = Object.keys(row);
  const lowerMap = new Map(keys.map((key) => [key.toLowerCase().trim(), key]));
  for (const candidate of candidates) {
    const hit = lowerMap.get(candidate);
    if (hit) return hit;
  }
  return null;
}

export function parseStrategyCsv(content: string): Map<string, number> {
  const parsed = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    throw new Error(`CSV 解析失败：${parsed.errors[0].message}`);
  }
  if (parsed.data.length === 0) {
    throw new Error("CSV 内容为空。");
  }

  const sample = parsed.data[0];
  const dateKey = guessKey(sample, DATE_HEADERS);
  const navKey = guessKey(sample, NAV_HEADERS);
  if (!dateKey || !navKey) {
    throw new Error("CSV 必须包含日期列和净值列。");
  }

  const dateToNav = new Map<string, number>();
  for (const row of parsed.data) {
    const dateRaw = String(row[dateKey] ?? "");
    const navRaw = Number(row[navKey]);
    const date = normalizeDate(dateRaw);
    if (!date || Number.isNaN(navRaw)) continue;
    dateToNav.set(date, navRaw);
  }
  if (dateToNav.size < 2) {
    throw new Error("有效数据不足，至少需要 2 个交易日。");
  }
  return dateToNav;
}

export async function loadBenchmarkSeries(key: BenchmarkKey): Promise<Map<string, number>> {
  const response = await fetch(`/benchmarks/${key}.json`);
  if (!response.ok) {
    throw new Error(`基准数据加载失败：${key}`);
  }
  const payload = (await response.json()) as BenchmarkPayload;
  const entries = Object.entries(payload.data ?? {});
  const output = new Map<string, number>();
  for (const [date, close] of entries) {
    const normalized = normalizeDate(date);
    if (normalized && Number.isFinite(close)) {
      output.set(normalized, close);
    }
  }
  if (output.size === 0) {
    throw new Error("基准数据为空。");
  }
  return output;
}

export function alignSeries(
  strategySeries: Map<string, number>,
  benchmarkSeries: Map<string, number>,
): TimePoint[] {
  const sharedDates: string[] = [];
  for (const date of strategySeries.keys()) {
    if (benchmarkSeries.has(date)) sharedDates.push(date);
  }
  sharedDates.sort((a, b) => (a < b ? -1 : 1));
  if (sharedDates.length < 2) {
    throw new Error("策略与基准没有足够重叠交易日。");
  }

  const firstBenchmark = benchmarkSeries.get(sharedDates[0])!;
  return sharedDates.map((date) => {
    const strategyNav = strategySeries.get(date)!;
    const benchmarkRaw = benchmarkSeries.get(date)!;
    return {
      date,
      strategyNav,
      benchmarkNav: benchmarkRaw / firstBenchmark,
    };
  });
}
