import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BenchmarkRadar } from "@/components/cards/benchmark-radar";
import { TradingCard } from "@/components/cards/trading-card";
import { Badge } from "@/components/ui/badge";
import { cardToView } from "@/lib/card-view";
import { cardKindLabel } from "@/lib/constants";
import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  getBenchmarkPreset,
  modelCategoryLabel,
} from "@/lib/model-benchmarks";
import { formatPricingFull } from "@/lib/model-pricing";
import { getCardById } from "@/lib/queries/cards";
import type { PublicCard } from "@/types/models";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const card = await getCardById(id);
  if (!card) {
    return { title: "Carte introuvable" };
  }
  return {
    title: card.name,
    description: card.short_description,
  };
}

function formatDate(value: string | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default async function CardPage({ params }: { params: Params }) {
  const { id } = await params;
  const card = (await getCardById(id)) as PublicCard | null;
  if (!card) {
    notFound();
  }

  const owner = card.collections.profiles;
  const view = cardToView(card);
  const category = view.modelCategory ?? null;
  const scores = (view.benchmarks ?? []).map((benchmark) => ({ key: benchmark.key, score: benchmark.score }));
  const scoreByKey = new Map((view.benchmarks ?? []).map((benchmark) => [benchmark.key, benchmark]));

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[360px_minmax(0,1fr)]">
      <TradingCard card={view} size="lg" className="mx-auto" />
      <div>
        <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">{cardKindLabel(card.kind)}</p>
        <h1 className="font-display mt-2 text-5xl text-ivory">{card.name}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Niveau {card.level}</Badge>
          {card.provider ? <Badge variant="secondary">{card.provider}</Badge> : null}
          {category ? <Badge variant="outline">{modelCategoryLabel(category)}</Badge> : null}
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-6 text-base leading-relaxed text-ivory/90">{card.description || card.short_description}</p>
        {card.kind === "model" ? (
          <div className="mt-8 space-y-8">
            {category ? (
              <>
                <BenchmarkRadar category={category} scores={scores} size="lg" />
                <ul className="space-y-3">
                  {getBenchmarkPreset(category).map((definition) => {
                    const stored = scoreByKey.get(definition.key);
                    return (
                      <li key={definition.key} className="rounded-lg border border-gold/20 bg-card px-4 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <h2 className="flex items-center gap-2 font-display text-xl">
                            <span
                              aria-hidden="true"
                              className="size-2.5 rounded-full"
                              style={{ background: definition.color }}
                            />
                            {definition.name}
                          </h2>
                          <span className="font-mono text-sm text-gold">
                            {stored
                              ? formatBenchmarkScore(getBenchmarkDefinition(category, stored.key) ?? definition, stored.score)
                              : "N/D"}
                          </span>
                        </div>
                        {stored ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {stored.version ? `Version ${stored.version}` : null}
                            {stored.measuredAt ? ` · ${formatDate(stored.measuredAt)}` : null}
                            {stored.sourceUrl ? (
                              <>
                                {" · "}
                                <a className="text-gold" href={stored.sourceUrl} rel="noreferrer" target="_blank">
                                  Source
                                </a>
                              </>
                            ) : null}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">Score non renseigné.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="rounded-lg border border-gold/20 bg-card px-4 py-3 text-sm text-muted-foreground">
                Catégorie non renseignée. Les benchmarks apparaîtront après une prochaine édition.
              </p>
            )}
            {view.pricing ? (
              <section className="rounded-lg border border-gold/20 bg-card px-4 py-3">
                <h2 className="font-display text-xl">Tarification</h2>
                <p className="mt-2 font-mono text-sm text-gold">{formatPricingFull(view.pricing)}</p>
              </section>
            ) : null}
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {card.card_abilities
              .sort((a, b) => a.position - b.position)
              .map((ability) => (
                <li key={ability.id} className="rounded-lg border border-gold/20 bg-card px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-xl">{ability.name}</h2>
                    <span className="font-mono text-sm text-gold">{ability.power}</span>
                  </div>
                  {ability.description ? <p className="mt-1 text-sm text-muted-foreground">{ability.description}</p> : null}
                </li>
              ))}
          </ul>
        )}
        <p className="mt-8 text-sm text-muted-foreground">
          Dans{" "}
          <Link className="text-gold" href={`/u/${owner.username}/${card.collections.slug}`}>
            {card.collections.name}
          </Link>{" "}
          par{" "}
          <Link className="text-gold" href={`/u/${owner.username}`}>
            {owner.display_name}
          </Link>
        </p>
      </div>
    </main>
  );
}
