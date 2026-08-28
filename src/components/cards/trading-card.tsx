"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { StarRow } from "@/components/cards/star-row";
import { cardKindLabel, type CardKind } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TradingCardView = {
  name: string;
  kind: CardKind;
  level: number;
  shortDescription: string;
  provider?: string | null;
  imageUrl?: string | null;
  abilities: { name: string; power: number }[];
};

type TradingCardProps = {
  card: TradingCardView;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function TradingCard({ card, className, size = "md" }: TradingCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, active: false });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) {
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

  const accent = card.kind === "agent" ? "text-holo" : "text-gold";
  const frame = card.kind === "agent" ? "from-holo/50 via-gold/40 to-arcane/60" : "from-gold/70 via-ivory/30 to-gold/20";

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "card-tilt relative aspect-[59/86] w-full max-w-[320px] [transform-style:preserve-3d]",
        size === "sm" && "max-w-[220px]",
        size === "lg" && "max-w-[380px]",
        className,
      )}
      style={{
        transform: reduceMotion ? undefined : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.active ? "transform 80ms linear" : "transform 400ms ease",
      }}
    >
      <div className={cn("absolute inset-0 rounded-[18px] bg-gradient-to-br p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.45)]", frame)}>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[16px] bg-nocturne">
          <header className="flex items-start justify-between gap-3 px-3 pt-3">
            <div>
              <p className={cn("font-mono text-[10px] tracking-[0.22em] uppercase", accent)}>
                {cardKindLabel(card.kind)}
              </p>
              <h3 className="font-display text-[1.35rem] leading-none text-ivory">{card.name}</h3>
            </div>
            <p className="font-mono text-xs text-gold">NIV {card.level}</p>
          </header>
          <StarRow level={card.level} className="px-3 pt-2" />
          <div className="relative mx-3 mt-3 overflow-hidden rounded-sm border border-gold/30 bg-obsidian">
            <div className="relative aspect-[4/3]">
              {card.imageUrl ? (
                <Image src={card.imageUrl} alt="" fill className="object-cover" sizes="320px" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--arcane)_40%,transparent),transparent_55%),#090b14]">
                  <span className="font-display text-3xl text-gold/70">{card.name.slice(0, 1)}</span>
                </div>
              )}
            </div>
            {card.provider ? (
              <p className="absolute right-2 bottom-2 bg-obsidian/80 px-1.5 font-mono text-[10px] tracking-wider text-ivory uppercase">
                {card.provider}
              </p>
            ) : null}
          </div>
          <p className="px-3 pt-3 text-sm leading-snug text-ivory/85">{card.shortDescription}</p>
          <ul className="mt-auto space-y-1.5 px-3 pb-3">
            {card.abilities.slice(0, 5).map((ability) => (
              <li key={ability.name} className="flex items-baseline justify-between gap-3 border-t border-gold/20 pt-1.5">
                <span className="text-xs text-ivory">{ability.name}</span>
                <span className="font-mono text-[11px] text-gold">{ability.power}</span>
              </li>
            ))}
          </ul>
          <div
            className="foil-sheen pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-200"
            style={{
              opacity: reduceMotion || !tilt.active ? 0 : 0.55,
              backgroundPosition: `${tilt.px}% ${tilt.py}%`,
            }}
          />
        </div>
      </div>
    </article>
  );
}
