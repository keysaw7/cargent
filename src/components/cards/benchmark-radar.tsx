"use client";

import { useId } from "react";

import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  type ModelCategory,
} from "@/lib/model-benchmarks";
import { buildRadarLayout, polygonToPath, ringToPath } from "@/lib/benchmark-radar";
import type { ScoredBenchmark } from "@/lib/benchmark-stats";
import { RADAR_PADDING, RADAR_VIEWBOX, type CardSize } from "@/lib/card-layout";
import { cn } from "@/lib/utils";

type BenchmarkRadarProps = {
  category: ModelCategory;
  scores: ScoredBenchmark[];
  size?: CardSize;
  showLabels?: boolean;
  className?: string;
};

function labelAnchor(angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    textAnchor: Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end",
    dx: Math.abs(cos) < 0.2 ? 0 : cos > 0 ? 6 : -6,
    dy: sin < -0.5 ? -6 : sin > 0.55 ? 12 : 4,
  };
}

export function BenchmarkRadar({
  category,
  scores,
  size = "md",
  showLabels = true,
  className,
}: BenchmarkRadarProps) {
  const px = RADAR_VIEWBOX[size];
  const layout = buildRadarLayout(category, scores, px, RADAR_PADDING[size]);
  const titleId = useId();
  const descId = useId();
  const scoredCount = layout.points.filter((point) => point.normalized !== null).length;

  return (
    <figure className={cn("m-0 flex h-full min-h-0 w-full flex-col items-start justify-start", className)}>
      <svg
        viewBox={`0 0 ${px} ${px}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="h-full w-full"
      >
        <title id={titleId}>Profil des benchmarks</title>
        <desc id={descId}>
          {scoredCount === 0
            ? "Aucun score renseigné."
            : `${scoredCount} score${scoredCount > 1 ? "s" : ""} renseigné${scoredCount > 1 ? "s" : ""} sur ${layout.points.length}.`}
        </desc>
        <circle
          cx={layout.cx}
          cy={layout.cy}
          r={layout.radius}
          fill="color-mix(in oklab, var(--obsidian) 70%, transparent)"
        />
        {layout.rings.map((ring, index) => (
          <path
            key={index}
            d={ringToPath(ring)}
            fill="none"
            stroke="color-mix(in oklab, var(--ivory) 16%, transparent)"
            strokeWidth="0.8"
          />
        ))}
        {layout.axes.map((axis, index) => (
          <line
            key={index}
            x1={layout.cx}
            y1={layout.cy}
            x2={axis.x}
            y2={axis.y}
            stroke="color-mix(in oklab, var(--ivory) 18%, transparent)"
            strokeWidth="0.8"
          />
        ))}
        {scoredCount > 0 ? (
          <path
            d={polygonToPath(layout.polygon)}
            fill="color-mix(in oklab, var(--bench-4) 18%, transparent)"
            stroke="var(--bench-4)"
            strokeWidth="1.6"
          />
        ) : null}
        {layout.points.map((point) =>
          point.normalized === null ? null : (
            <circle
              key={point.key}
              cx={point.x}
              cy={point.y}
              r={size === "sm" ? 3.2 : 4}
              fill={point.color}
            />
          ),
        )}
        {showLabels
          ? layout.points.map((point) => {
              const anchor = labelAnchor(point.angle);
              return (
                <text
                  key={`${point.key}-label`}
                  x={point.axisX + anchor.dx}
                  y={point.axisY + anchor.dy}
                  textAnchor={anchor.textAnchor as "start" | "middle" | "end"}
                  fill="var(--ivory)"
                  fontSize={size === "lg" ? 9 : 8}
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                >
                  {point.shortLabel}
                </text>
              );
            })
          : null}
      </svg>
      <ul className="sr-only">
        {layout.points.map((point) => {
          const definition = getBenchmarkDefinition(category, point.key);
          return (
            <li key={point.key}>
              {point.name}
              {": "}
              {point.score === null || !definition
                ? "non renseigné"
                : formatBenchmarkScore(definition, point.score)}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
