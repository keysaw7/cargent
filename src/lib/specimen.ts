import type { TradingCardView } from "@/components/cards/trading-card";

export const SPECIMEN_CARD: TradingCardView = {
  name: "Atlas",
  kind: "agent",
  level: 8,
  shortDescription: "Lit tes sources, recoupe les faits et pose la question qui manque.",
  provider: "OpenAI",
  abilities: [
    { name: "Recoupement", power: 86 },
    { name: "Mémoire courte", power: 72 },
    { name: "Relance utile", power: 64 },
  ],
};
