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
    { key: "swe-bench-pro", score: 79.2, version: "2026-07", sourceUrl: "https://swebench.com/pro", measuredAt: "2026-07-24" },
    { key: "terminal-bench-2-1", score: 89.1, version: "2.1", sourceUrl: "https://www.tbench.ai", measuredAt: "2026-07-24" },
    { key: "livecodebench", score: 74.0, version: "2026-06", sourceUrl: "https://livecodebench.github.io", measuredAt: "2026-07-24" },
    { key: "aider-polyglot", score: 82.5, version: "polyglot", sourceUrl: "https://aider.chat/docs/leaderboards", measuredAt: "2026-07-24" },
    { key: "scicode", score: 61.0, version: "2025", sourceUrl: "https://scicode-bench.github.io", measuredAt: "2026-07-24" },
    { key: "aa-briefcase", score: 1747, version: "v2", sourceUrl: "https://artificialanalysis.ai", measuredAt: "2026-07-24" },
  ],
  pricing: {
    category: "code",
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 25,
  },
};
