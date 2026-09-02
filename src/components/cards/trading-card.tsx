"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

import { BenchmarkEffortLine } from "@/components/cards/benchmark-effort-line";
import { BenchmarkRadar } from "@/components/cards/benchmark-radar";
import { StarRow } from "@/components/cards/star-row";
import type { BenchmarkEffortScores } from "@/lib/benchmark-efforts";
import { selectBestBenchmark } from "@/lib/benchmark-stats";
import { getCardTemplateStyle } from "@/lib/card-templates";
import {
  CARD_IMAGE_ASPECT_CLASS,
  CARD_MAX_WIDTH_PX,
  cardFrameClass,
  effortDensityForCard,
  radarSizeForFrontFooter,
  type CardSize,
} from "@/lib/card-layout";
import { cardKindLabel, DEFAULT_CARD_TEMPLATE, type CardKind, type CardTemplate } from "@/lib/constants";
import { getBenchmarkDefinition, type ModelCategory } from "@/lib/model-benchmarks";
import { formatPricingCompact, formatPricingCorner, type ModelPricingView } from "@/lib/model-pricing";
import { cn } from "@/lib/utils";

export type TradingCardBenchmark = {
  key: string;
  efforts: BenchmarkEffortScores;
  version?: string;
  sourceUrl?: string;
  measuredAt?: string;
};

export type TradingCardView = {
  name: string;
  kind: CardKind;
  template?: CardTemplate;
  level: number;
  shortDescription: string;
  provider?: string | null;
  imageUrl?: string | null;
  abilities: { name: string; power: number }[];
  modelCategory?: ModelCategory | null;
  benchmarks?: TradingCardBenchmark[];
  pricing?: ModelPricingView | null;
};

type TradingCardProps = {
  card: TradingCardView;
  className?: string;
  size?: CardSize;
  interactive?: boolean;
  footerVisual?: "effort" | "radar";
};

function TemplateDecoration({
  decoration,
}: {
  decoration: ReturnType<typeof getCardTemplateStyle>["decoration"];
}) {
  switch (decoration) {
    case "none":
      return null;
    case "halo":
      return <div className="card-halo pointer-events-none absolute inset-0 opacity-80" />;
    case "scanlines":
      return <div className="card-scanlines pointer-events-none absolute inset-0 opacity-70" />;
    case "binder":
      return <div className="binder-grid pointer-events-none absolute inset-0 opacity-25" />;
    case "parchment":
      return <div className="card-parchment pointer-events-none absolute inset-0" />;
    default: {
      const exhaustive: never = decoration;
      return exhaustive;
    }
  }
}

function ModelFooter({
  card,
  size,
  footerVisual,
  powerClass,
}: {
  card: TradingCardView;
  size: CardSize;
  footerVisual: "effort" | "radar";
  powerClass: string;
}) {
  const category = card.modelCategory ?? null;
  const scores = (card.benchmarks ?? []).map((benchmark) => ({
    key: benchmark.key,
    efforts: benchmark.efforts,
  }));

  if (!category) {
    return (
      <p className="px-3 pb-3 font-mono text-[11px] tracking-[0.12em] text-ivory/55 uppercase">
        Catégorie non renseignée
      </p>
    );
  }

  const priceLabel = card.pricing ? (
    <p className={cn("mt-1 shrink-0 text-right font-mono text-[10px] leading-none tracking-[0.04em]", powerClass)}>
      <span className="sr-only">{formatPricingCompact(card.pricing)}</span>
      <span aria-hidden="true">{formatPricingCorner(card.pricing)}</span>
    </p>
  ) : null;

  if (footerVisual === "radar") {
    return (
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1">
        <BenchmarkRadar
          category={category}
          scores={scores}
          size={radarSizeForFrontFooter(size)}
          showLabels={size !== "sm"}
          className="min-h-0 flex-1"
        />
        {priceLabel}
      </div>
    );
  }

  const best = selectBestBenchmark(category, scores);
  const definition = best ? getBenchmarkDefinition(category, best.key) : undefined;

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col px-2 pb-1 pt-1">
      {best && definition ? (
        <BenchmarkEffortLine
          definition={definition}
          efforts={best.efforts}
          density={effortDensityForCard(size)}
          className="min-h-0 flex-1"
        />
      ) : (
        <p className="font-mono text-[11px] tracking-[0.12em] text-ivory/55 uppercase">Benchmarks non renseignés</p>
      )}
    </div>
  );
}

export function TradingCard({
  card,
  className,
  size = "md",
  interactive = true,
  footerVisual = "effort",
}: TradingCardProps) {
  const titleId = useId();
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, active: false });
  const [reduceMotion, setReduceMotion] = useState(false);
  const style = getCardTemplateStyle(card.template ?? DEFAULT_CARD_TEMPLATE);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !interactive) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - bounds.left) / bounds.width) * 100;
    const py = ((event.clientY - bounds.top) / bounds.height) * 100;
    setTilt({
      x: ((py - 50) / 50) * -8,
      y: ((px - 50) / 50) * 10,
      px,
      py,
      active: true,
    });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0, px: 50, py: 50, active: false });
  }

  const showFoil = interactive && !reduceMotion && tilt.active;

  return (
    <article
      aria-labelledby={titleId}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("card-tilt relative [transform-style:preserve-3d]", cardFrameClass(size), className)}
      style={{
        transform: reduceMotion || !interactive ? undefined : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.active ? "transform 80ms linear" : "transform 400ms ease",
      }}
    >
      <div className={cn("absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.45)]", style.outerRadius, style.frameClass, style.framePadding)}>
        <div className={cn("h-full", style.doubleRing && "bg-ivory/15 p-px", style.innerRadius)}>
          <div className={cn("relative flex h-full flex-col overflow-hidden", style.innerClass, style.innerRadius)}>
            <TemplateDecoration decoration={style.decoration} />
            <header className="relative z-10 flex shrink-0 items-start justify-between gap-3 px-3 pt-3">
              <div className="min-w-0">
                <p className={cn(style.kindClass, style.accentClass)}>{cardKindLabel(card.kind)}</p>
                <h3 id={titleId} className={cn("line-clamp-2", style.titleClass)}>
                  {card.name}
                </h3>
              </div>
              <p className={cn("shrink-0", style.levelClass)}>NIV {card.level}</p>
            </header>
            <StarRow
              level={card.level}
              className="relative z-10 shrink-0 px-3 pt-2"
              filledClass={style.starFilledClass}
              emptyClass={style.starEmptyClass}
            />
            <div className={cn("relative z-10 mx-3 mt-3 shrink-0", style.imageWrapClass)}>
              <div className={cn("relative", CARD_IMAGE_ASPECT_CLASS)}>
                {card.imageUrl ? (
                  <Image src={card.imageUrl} alt="" fill className="object-cover" sizes={`${CARD_MAX_WIDTH_PX[size]}px`} />
                ) : (
                  <div className={cn("flex h-full items-center justify-center", style.imagePlaceholderClass)}>
                    <span className={cn("font-display text-3xl", style.accentClass, "opacity-70")}>
                      {card.name.slice(0, 1)}
                    </span>
                  </div>
                )}
              </div>
              {card.provider ? (
                <p className={cn("absolute right-2 bottom-2", style.providerClass)}>{card.provider}</p>
              ) : null}
            </div>
            {card.kind === "model" ? (
              <ModelFooter card={card} size={size} footerVisual={footerVisual} powerClass={style.abilityPowerClass} />
            ) : (
              <>
                <p className={cn("relative z-10 line-clamp-3 px-3 pt-3", style.bodyClass)}>{card.shortDescription}</p>
                <ul className="relative z-10 mt-auto space-y-1.5 px-3 pb-3">
                  {card.abilities.slice(0, 5).map((ability) => (
                    <li key={ability.name} className={cn("flex items-baseline justify-between gap-3 pt-1.5", style.abilityRowClass)}>
                      <span className={cn("min-w-0 truncate", style.abilityNameClass)}>{ability.name}</span>
                      <span className={cn("shrink-0", style.abilityPowerClass)}>{ability.power}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-200",
                style.foilClass,
              )}
              style={{
                opacity: showFoil ? style.foilOpacity : 0,
                backgroundPosition: `${tilt.px}% ${tilt.py}%`,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
