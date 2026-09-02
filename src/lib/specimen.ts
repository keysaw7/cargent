import type { TradingCardView } from "@/components/cards/trading-card";

export const SPECIMEN_CARD: TradingCardView = {
  name: "Atlas",
  kind: "agent",
  template: "classique",
  level: 8,
  shortDescription: "Lit tes sources, recoupe les faits et pose la question qui manque.",
  provider: "OpenAI",
  abilities: [
    { name: "Recoupement", power: 86 },
    { name: "Mémoire courte", power: 72 },
    { name: "Relance utile", power: 64 },
  ],
};

export const SPECIMEN_MODEL_CARD: TradingCardView = {
  name: "Forge",
  kind: "model",
  template: "signal",
  level: 11,
  shortDescription: "Modèle de code frontier pour le travail agentique.",
  provider: "Anthropic",
  abilities: [],
  modelCategory: "code",
  benchmarks: [
    {
      key: "swe-bench-pro",
      efforts: { low: 46.8, medium: 61.4, high: 74.2, xhigh: 82.6 },
      version: "2026-07",
      sourceUrl: "https://swebench.com/pro",
      measuredAt: "2026-07-24",
    },
    {
      key: "terminal-bench-2-1",
      efforts: { low: 55.1, medium: 71.8, high: 84.6, xhigh: 91.3 },
      version: "2.1",
      sourceUrl: "https://www.tbench.ai",
      measuredAt: "2026-07-24",
    },
    {
      key: "livecodebench",
      efforts: { low: 51.4, medium: 64.0, high: 76.8, xhigh: 84.2 },
      version: "2026-06",
      sourceUrl: "https://livecodebench.github.io",
      measuredAt: "2026-07-24",
    },
    {
      key: "aider-polyglot",
      efforts: { low: 58.6, medium: 72.1, high: 83.4, xhigh: 90.8 },
      version: "polyglot",
      sourceUrl: "https://aider.chat/docs/leaderboards",
      measuredAt: "2026-07-24",
    },
    {
      key: "scicode",
      efforts: { low: 38.5, medium: 49.2, high: 61.7, xhigh: 69.4 },
      version: "2025",
      sourceUrl: "https://scicode-bench.github.io",
      measuredAt: "2026-07-24",
    },
    {
      key: "aa-briefcase",
      efforts: { low: 1280, medium: 1490, high: 1680, xhigh: 1864 },
      version: "v2",
      sourceUrl: "https://artificialanalysis.ai",
      measuredAt: "2026-07-24",
    },
  ],
  pricing: {
    category: "code",
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 25,
  },
};
