import type { BenchmarkDefinition } from "@/lib/model-benchmarks";
import { normalizeBenchmarkScore } from "@/lib/model-benchmarks";

export const EFFORT_LEVELS = ["low", "medium", "high", "xhigh"] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const EFFORT_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "XHigh",
} as const satisfies Record<EffortLevel, string>;

export type BenchmarkEffortScores = {
  low: number | null;
  medium: number | null;
  high: number | null;
  xhigh: number | null;
};

export type PresentEffort = {
  level: EffortLevel;
  score: number;
};

export function emptyEffortScores(): BenchmarkEffortScores {
  return {
    low: null,
    medium: null,
    high: null,
    xhigh: null,
  };
}

export function effortScoresFromLegacy(score: number): BenchmarkEffortScores {
  return {
    ...emptyEffortScores(),
    xhigh: score,
  };
}

export function isFiniteScore(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value);
}

export function hasAnyEffort(scores: BenchmarkEffortScores): boolean {
  return EFFORT_LEVELS.some((level) => isFiniteScore(scores[level]));
}

export function presentEfforts(scores: BenchmarkEffortScores): PresentEffort[] {
  return EFFORT_LEVELS.flatMap((level) => {
    const score = scores[level];
    return isFiniteScore(score) ? [{ level, score }] : [];
  });
}

export function effectiveEffort(scores: BenchmarkEffortScores): PresentEffort | null {
  for (const level of [...EFFORT_LEVELS].reverse()) {
    const score = scores[level];
    if (isFiniteScore(score)) {
      return { level, score };
    }
  }
  return null;
}

export function xhighScore(scores: BenchmarkEffortScores): number | null {
  return isFiniteScore(scores.xhigh) ? scores.xhigh : null;
}

export function firstMonotonicViolation(scores: BenchmarkEffortScores): EffortLevel | null {
  const present = presentEfforts(scores);
  for (let index = 1; index < present.length; index += 1) {
    const previous = present[index - 1];
    const current = present[index];
    if (!previous || !current) {
      continue;
    }
    if (current.score < previous.score) {
      return current.level;
    }
  }
  return null;
}

export type EffortLinePoint = {
  level: EffortLevel;
  label: string;
  score: number;
  normalized: number;
  x: number;
  y: number;
};

export type EffortLineLayout = {
  width: number;
  height: number;
  points: EffortLinePoint[];
  path: string;
};

export function buildEffortLineLayout(
  definition: BenchmarkDefinition,
  scores: BenchmarkEffortScores,
  width = 160,
  height = 36,
  padding = { x: 8, y: 8 },
): EffortLineLayout {
  const plotWidth = Math.max(1, width - padding.x * 2);
  const plotHeight = Math.max(1, height - padding.y * 2);
  const points: EffortLinePoint[] = [];

  EFFORT_LEVELS.forEach((level, index) => {
    const score = scores[level];
    if (!isFiniteScore(score)) {
      return;
    }
    const normalized = normalizeBenchmarkScore(definition, score);
    points.push({
      level,
      label: EFFORT_LABELS[level],
      score,
      normalized,
      x: padding.x + (index / (EFFORT_LEVELS.length - 1)) * plotWidth,
      y: padding.y + (1 - normalized / 100) * plotHeight,
    });
  });

  const path =
    points.length === 0
      ? ""
      : points
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
          .join(" ");

  return { width, height, points, path };
}
