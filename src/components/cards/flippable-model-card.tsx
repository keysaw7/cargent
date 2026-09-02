"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { ModelCardBack } from "@/components/cards/model-card-back";
import { TradingCard, type TradingCardView } from "@/components/cards/trading-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FlippableModelCardProps = {
  card: TradingCardView;
  href: string;
  size?: "sm" | "md" | "lg";
};

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
    <div
      className={cn(
        "flex w-full flex-col items-center",
        size === "sm" ? "max-w-[220px]" : size === "lg" ? "max-w-[380px]" : "max-w-[320px]",
      )}
    >
      <div className="relative aspect-[59/86] w-full [perspective:1200px]">
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
            <Link href={href} className="block h-full focus-visible:rounded-[18px]">
              <TradingCard card={card} size={size} interactive={!flipped} className="max-w-none" />
            </Link>
          </div>
          <div
            className="absolute inset-0 card-flip-face [transform:rotateY(180deg)]"
            aria-hidden={!flipped || undefined}
          >
            <Link href={href} className="block h-full focus-visible:rounded-[18px]">
              <ModelCardBack card={card} size={size} className="max-w-none" />
            </Link>
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
