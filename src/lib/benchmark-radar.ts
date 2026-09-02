import {
  getBenchmarkPreset,
  type BenchmarkDefinition,
  type ModelCategory,
} from "@/lib/model-benchmarks";
import { effectiveEffort } from "@/lib/benchmark-efforts";
import { normalizePresentScore, type ScoredBenchmark } from "@/lib/benchmark-stats";

export type RadarPoint = {
  key: string;
  name: string;
  shortLabel: string;
  score: number | null;
  normalized: number | null;
  color: string;
  x: number;
  y: number;
  axisX: number;
  axisY: number;
  angle: number;
};

export type RadarLayout = {
  cx: number;
  cy: number;
  radius: number;
  rings: number[][];
  axes: Array<{ x: number; y: number }>;
  points: RadarPoint[];
  polygon: Array<{ x: number; y: number }>;
  complete: boolean;
};

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

export function buildRadarLayout(
  category: ModelCategory,
  scores: ScoredBenchmark[],
  size = 200,
  padding = 28,
): RadarLayout {
  const preset = getBenchmarkPreset(category);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;
  const scoreByKey = new Map(
    scores.flatMap((entry) => {
      const effective = effectiveEffort(entry.efforts);
      return effective ? [[entry.key, effective.score] as const] : [];
    }),
  );

  const points: RadarPoint[] = preset.map((definition, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / preset.length;
    const axis = polarPoint(cx, cy, radius, angle);
    const rawScore = scoreByKey.get(definition.key);
    const hasScore = rawScore !== undefined && Number.isFinite(rawScore);
    const normalized = hasScore
      ? normalizePresentScore(category, definition.key, rawScore)
      : null;
    const valueRadius = normalized === null ? 0 : (normalized / 100) * radius;
    const vertex = polarPoint(cx, cy, valueRadius, angle);

    return {
      key: definition.key,
      name: definition.name,
      shortLabel: definition.shortLabel,
      score: hasScore ? rawScore : null,
      normalized,
      color: definition.color,
      x: vertex.x,
      y: vertex.y,
      axisX: axis.x,
      axisY: axis.y,
      angle,
    };
  });

  const scoredPoints = points.filter((point) => point.normalized !== null);
  const complete = scoredPoints.length === preset.length && preset.length > 0;

  const rings = [0.25, 0.5, 0.75, 1].map((ratio) =>
    preset.flatMap((_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / preset.length;
      const point = polarPoint(cx, cy, radius * ratio, angle);
      return [point.x, point.y];
    }),
  );

  return {
    cx,
    cy,
    radius,
    rings,
    axes: points.map((point) => ({ x: point.axisX, y: point.axisY })),
    points,
    polygon: points.map((point) => ({ x: point.x, y: point.y })),
    complete,
  };
}

export function polygonToPath(vertices: Array<{ x: number; y: number }>): string {
  if (vertices.length === 0) {
    return "";
  }
  const [first, ...rest] = vertices;
  if (!first) {
    return "";
  }
  return `M ${first.x} ${first.y} ${rest.map((vertex) => `L ${vertex.x} ${vertex.y}`).join(" ")} Z`;
}

export function ringToPath(values: number[]): string {
  const vertices: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < values.length; index += 2) {
    const x = values[index];
    const y = values[index + 1];
    if (x === undefined || y === undefined) {
      continue;
    }
    vertices.push({ x, y });
  }
  return polygonToPath(vertices);
}

export function radarPointDefinitions(category: ModelCategory): BenchmarkDefinition[] {
  return getBenchmarkPreset(category);
}
