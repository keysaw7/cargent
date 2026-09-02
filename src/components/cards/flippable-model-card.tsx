"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";

import { ModelCardBack } from "@/components/cards/model-card-back";
import { TradingCard, type TradingCardView } from "@/components/cards/trading-card";
import { Button } from "@/components/ui/button";
import { CARD_ASPECT_CLASS, CARD_MAX_WIDTH_CLASS, type CardSize } from "@/lib/card-layout";
import { cn } from "@/lib/utils";

type FlippableModelCardProps = {
  card: TradingCardView;
  href?: string;
  size?: CardSize;
};

function FlipFace({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  if (!href) {
    return children;
  }

  return (
    <Link href={href} className="block h-full focus-visible:rounded-[18px]">
      {children}
    </Link>
  );
}

export function FlippableModelCard({ card, href, size = "sm" }: FlippableModelCardProps) {
  const panelId = useId();
  const [flipped, setFlipped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className={cn("flex w-full flex-col items-center", CARD_MAX_WIDTH_CLASS[size])}>
      <div className={cn("relative w-full [perspective:1200px]", CARD_ASPECT_CLASS)}>
        <div
          id={panelId}
          className={cn(
            "absolute inset-0 [transform-style:preserve-3d]",
            !reduceMotion && "transition-transform duration-500",
          )}
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: reduceMotion ? "none" : undefined,
          }}
        >
          <div
            className="absolute inset-0 card-flip-face"
            aria-hidden={flipped || undefined}
          >
            <FlipFace href={href}>
              <TradingCard card={card} size={size} interactive={!flipped} className="max-w-none" />
            </FlipFace>
          </div>
          <div
            className="absolute inset-0 card-flip-face [transform:rotateY(180deg)]"
            aria-hidden={!flipped || undefined}
          >
            <FlipFace href={href}>
              <ModelCardBack card={card} size={size} className="max-w-none" />
            </FlipFace>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-3 h-11 min-w-[44px] px-4"
        aria-pressed={flipped}
        aria-controls={panelId}
        aria-label={
          flipped ? `Voir le recto de ${card.name}` : `Retourner la carte ${card.name}`
        }
        onClick={() => setFlipped((current) => !current)}
      >
        {flipped ? "Voir le recto" : "Retourner"}
      </Button>
    </div>
  );
}
