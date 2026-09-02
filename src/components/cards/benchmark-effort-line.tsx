"use client";

import { useEffect, useRef, useState } from "react";

import { EFFORT_LABELS, EFFORT_LEVELS, buildEffortLineLayout, type BenchmarkEffortScores } from "@/lib/benchmark-efforts";
import type { EffortLineDensity } from "@/lib/card-layout";
import { formatBenchmarkScore, type BenchmarkDefinition } from "@/lib/model-benchmarks";
import { cn } from "@/lib/utils";

type BenchmarkEffortLineProps = {
  definition: BenchmarkDefinition;
  efforts: BenchmarkEffortScores;
  density?: EffortLineDensity;
  className?: string;
};

function effortLineMetrics(density: EffortLineDensity) {
  switch (density) {
    case "detailed":
      return {
        fallbackSize: { width: 220, height: 56 },
        padding: { x: 14, y: 14 },
        stroke: 1.8,
        radius: 3.2,
        showPointLabels: true,
        showInsetName: false,
        scoreFontSize: 7,
        nameFontSize: 0,
      };
    case "card":
      return {
        fallbackSize: { width: 360, height: 180 },
        padding: { x: 8, y: 16 },
        stroke: 2,
        radius: 4,
        showPointLabels: false,
        showInsetName: true,
        scoreFontSize: 9,
        nameFontSize: 11,
      };
    case "compact":
      return {
        fallbackSize: { width: 200, height: 58 },
        padding: { x: 4, y: 9 },
        stroke: 1.6,
        radius: 2.6,
        showPointLabels: false,
        showInsetName: true,
        scoreFontSize: 7,
        nameFontSize: 8,
      };
    default: {
      const exhaustive: never = density;
      return exhaustive;
    }
  }
}

export function BenchmarkEffortLine({
  definition,
  efforts,
  density = "compact",
  className,
}: BenchmarkEffortLineProps) {
  const metrics = effortLineMetrics(density);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(metrics.fallbackSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = ({ width, height }: Pick<DOMRectReadOnly, "width" | "height">) => {
      if (width <= 0 || height <= 0) {
        return;
      }
      setSize((current) =>
        Math.abs(current.width - width) < 0.5 && Math.abs(current.height - height) < 0.5
          ? current
          : { width, height },
      );
    };

    updateSize(container.getBoundingClientRect());
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        updateSize(entry.contentRect);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const layout = buildEffortLineLayout(definition, efforts, size.width, size.height, metrics.padding);
  const xhighPoint = layout.points.find((point) => point.level === "xhigh");
  const xhighLabel = xhighPoint ? formatBenchmarkScore(definition, xhighPoint.score) : null;
  const xhighLabelHalfWidth = xhighLabel ? xhighLabel.length * metrics.scoreFontSize * 0.31 : 0;
  const labels = EFFORT_LEVELS.map((level) => {
    const score = efforts[level];
    return score == null
      ? `${EFFORT_LABELS[level]} non renseigné`
      : `${EFFORT_LABELS[level]} ${formatBenchmarkScore(definition, score)}`;
  }).join(", ");

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={`${definition.name}: ${layout.points.length === 0 ? "aucun effort renseigné" : labels}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={metrics.padding.x}
          x2={layout.width - metrics.padding.x}
          y1={layout.height / 2}
          y2={layout.height / 2}
          stroke="color-mix(in oklab, var(--ivory) 18%, transparent)"
          strokeWidth="1"
        />
        {metrics.showInsetName ? (
          <text
            x={metrics.padding.x}
            y={metrics.nameFontSize + 3}
            textAnchor="start"
            fill="var(--ivory)"
            fontSize={metrics.nameFontSize}
            fontFamily="IBM Plex Mono, ui-monospace, monospace"
            letterSpacing="0.14em"
          >
            {definition.shortLabel.toUpperCase()}
          </text>
        ) : null}
        {layout.path ? (
          <path d={layout.path} fill="none" stroke={definition.color} strokeWidth={metrics.stroke} />
        ) : null}
        {layout.points.map((point) => (
          <circle key={point.level} cx={point.x} cy={point.y} r={metrics.radius} fill={definition.color} />
        ))}
        {metrics.showPointLabels
          ? layout.points.map((point) => (
              <text
                key={`${point.level}-label`}
                x={point.x}
                y={Math.max(9, point.y - 7)}
                textAnchor="middle"
                fill={definition.color}
                fontSize="7"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
              >
                {point.label}
              </text>
            ))
          : null}
        {!metrics.showPointLabels && xhighPoint && xhighLabel ? (
          <text
            x={Math.min(layout.width - xhighLabelHalfWidth, Math.max(xhighLabelHalfWidth, xhighPoint.x))}
            y={Math.min(layout.height - 3, xhighPoint.y + metrics.scoreFontSize + 4)}
            textAnchor="middle"
            fill={definition.color}
            fontSize={metrics.scoreFontSize}
            fontFamily="IBM Plex Mono, ui-monospace, monospace"
          >
            {xhighLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
