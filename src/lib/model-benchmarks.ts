export const MODEL_CATEGORIES = ["code", "image", "video"] as const;

export type ModelCategory = (typeof MODEL_CATEGORIES)[number];

export type BenchmarkUnit = "percent" | "score" | "elo";

export type BenchmarkDefinition = {
  key: string;
  name: string;
  shortLabel: string;
  description: string;
  unit: BenchmarkUnit;
  decimals: number;
  domain: { min: number; max: number };
  referenceUrl: string;
  color: string;
};

export const MAX_BENCHMARKS_PER_PRESET = 6;
export const MIN_BENCHMARK_KEY = 2;
export const MAX_BENCHMARK_KEY = 40;
export const MAX_BENCHMARK_VERSION = 40;
export const MIN_SOURCE_URL = 12;
export const MAX_SOURCE_URL = 240;
export const MAX_PRICE_USD = 100_000;

const BENCH_COLORS = [
  "var(--bench-1)",
  "var(--bench-2)",
  "var(--bench-3)",
  "var(--bench-4)",
  "var(--bench-5)",
  "var(--bench-6)",
] as const;

function withColors(definitions: Omit<BenchmarkDefinition, "color">[]): BenchmarkDefinition[] {
  return definitions.map((definition, index) => {
    const color = BENCH_COLORS[index];
    if (!color) {
      throw new Error("Un preset de benchmarks doit contenir six définitions.");
    }
    return { ...definition, color };
  });
}

const CODE_BENCHMARKS = withColors([
  {
    key: "swe-bench-pro",
    name: "SWE-bench Pro",
    shortLabel: "SWE Pro",
    description: "Issues professionnelles de dépôts réels, plus difficiles que SWE-bench Verified.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://swebench.com/pro",
  },
  {
    key: "terminal-bench-2-1",
    name: "Terminal-Bench 2.1",
    shortLabel: "Terminal",
    description: "Tâches autonomes dans un terminal : compilation, admin, debug, workflows.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://www.tbench.ai",
  },
  {
    key: "livecodebench",
    name: "LiveCodeBench",
    shortLabel: "LiveCode",
    description: "Programmation compétitive renouvelée pour limiter la contamination.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://livecodebench.github.io",
  },
  {
    key: "aider-polyglot",
    name: "Aider Polyglot",
    shortLabel: "Aider",
    description: "Édition de code multi-langages dans un flux d’agent de programmation.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://aider.chat/docs/leaderboards",
  },
  {
    key: "scicode",
    name: "SciCode",
    shortLabel: "SciCode",
    description: "Génération de code scientifique à partir de problèmes de recherche.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://scicode-bench.github.io",
  },
  {
    key: "aa-briefcase",
    name: "AA-Briefcase",
    shortLabel: "Briefcase",
    description: "Travail de connaissance agentique (Elo Artificial Analysis).",
    unit: "elo",
    decimals: 0,
    domain: { min: 500, max: 2500 },
    referenceUrl: "https://artificialanalysis.ai",
  },
]);

const IMAGE_BENCHMARKS = withColors([
  {
    key: "image-arena-elo",
    name: "Image Arena Elo",
    shortLabel: "Arena",
    description: "Préférence humaine en aveugle, classée en Elo.",
    unit: "elo",
    decimals: 0,
    domain: { min: 800, max: 1600 },
    referenceUrl: "https://artificialanalysis.ai/image/leaderboard/text-to-image",
  },
  {
    key: "geneval",
    name: "GenEval",
    shortLabel: "GenEval",
    description: "Alignement objet, attributs et relations dans l’image générée.",
    unit: "score",
    decimals: 2,
    domain: { min: 0, max: 1 },
    referenceUrl: "https://github.com/djghosh13/geneval",
  },
  {
    key: "dpg-bench",
    name: "DPG-Bench",
    shortLabel: "DPG",
    description: "Suivi de prompts denses, souvent reporté sur 100.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://github.com/TencentARC/DPG-Bench",
  },
  {
    key: "t2i-compbench",
    name: "T2I-CompBench",
    shortLabel: "CompBench",
    description: "Composition attributs, relations et nombres dans le text-to-image.",
    unit: "score",
    decimals: 2,
    domain: { min: 0, max: 1 },
    referenceUrl: "https://github.com/Karine-Huang/T2I-CompBench",
  },
  {
    key: "imagereward",
    name: "ImageReward",
    shortLabel: "Reward",
    description: "Score de préférence humaine pour le text-to-image.",
    unit: "score",
    decimals: 2,
    domain: { min: -2, max: 2 },
    referenceUrl: "https://github.com/zai-org/ImageReward",
  },
  {
    key: "clipscore",
    name: "CLIPScore",
    shortLabel: "CLIP",
    description: "Similarité CLIP texte-image, reportée ici sur 100.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://github.com/jmhessel/clipscore",
  },
]);

const VIDEO_BENCHMARKS = withColors([
  {
    key: "video-arena-elo",
    name: "Video Arena Elo",
    shortLabel: "Arena",
    description: "Préférence humaine en aveugle pour la génération vidéo.",
    unit: "elo",
    decimals: 0,
    domain: { min: 800, max: 1600 },
    referenceUrl: "https://artificialanalysis.ai/video/leaderboard",
  },
  {
    key: "vbench",
    name: "VBench",
    shortLabel: "VBench",
    description: "Qualité vidéo agrégée sur seize dimensions.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://vchitect.github.io/VBench-project",
  },
  {
    key: "vbench-2",
    name: "VBench 2.0",
    shortLabel: "VBench 2",
    description: "Suite VBench étendue, plus exigeante sur le mouvement et la fidélité.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://vchitect.github.io/VBench-2.0-project",
  },
  {
    key: "t2v-compbench",
    name: "T2V-CompBench",
    shortLabel: "CompBench",
    description: "Composition spatio-temporelle en text-to-video.",
    unit: "score",
    decimals: 2,
    domain: { min: 0, max: 1 },
    referenceUrl: "https://github.com/KaiyueSun98/T2V-CompBench",
  },
  {
    key: "moviegenbench",
    name: "MovieGenBench",
    shortLabel: "MovieGen",
    description: "Qualité, alignement et mouvement sur les prompts Movie Gen.",
    unit: "percent",
    decimals: 1,
    domain: { min: 0, max: 100 },
    referenceUrl: "https://github.com/facebookresearch/MovieGenBench",
  },
  {
    key: "videogen-eval",
    name: "VideoGen-Eval",
    shortLabel: "VG-Eval",
    description: "Évaluation agentique de la fidélité des vidéos générées.",
    unit: "score",
    decimals: 2,
    domain: { min: 0, max: 1 },
    referenceUrl: "https://arxiv.org/abs/2503.23452",
  },
]);

export const MODEL_BENCHMARK_PRESETS: Record<ModelCategory, BenchmarkDefinition[]> = {
  code: CODE_BENCHMARKS,
  image: IMAGE_BENCHMARKS,
  video: VIDEO_BENCHMARKS,
};

export function isModelCategory(value: unknown): value is ModelCategory {
  return typeof value === "string" && (MODEL_CATEGORIES as readonly string[]).includes(value);
}

export function modelCategoryLabel(category: ModelCategory): string {
  switch (category) {
    case "code":
      return "Code";
    case "image":
      return "Image";
    case "video":
      return "Vidéo";
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

export function getBenchmarkPreset(category: ModelCategory): BenchmarkDefinition[] {
  return MODEL_BENCHMARK_PRESETS[category];
}

export function getBenchmarkDefinition(
  category: ModelCategory,
  key: string,
): BenchmarkDefinition | undefined {
  return getBenchmarkPreset(category).find((definition) => definition.key === key);
}

export function isBenchmarkKey(category: ModelCategory, key: string): boolean {
  return Boolean(getBenchmarkDefinition(category, key));
}

export function clampScoreToDomain(definition: BenchmarkDefinition, score: number): number {
  if (!Number.isFinite(score)) {
    return definition.domain.min;
  }
  return Math.min(definition.domain.max, Math.max(definition.domain.min, score));
}

export function normalizeBenchmarkScore(definition: BenchmarkDefinition, score: number): number {
  const { min, max } = definition.domain;
  const span = max - min;
  if (span <= 0) {
    return 0;
  }
  const clamped = clampScoreToDomain(definition, score);
  return ((clamped - min) / span) * 100;
}

export function formatBenchmarkScore(definition: BenchmarkDefinition, score: number): string {
  const formatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: definition.decimals,
    maximumFractionDigits: definition.decimals,
  });
  const formatted = formatter.format(score);

  switch (definition.unit) {
    case "percent":
      return `${formatted} %`;
    case "elo":
      return formatted;
    case "score":
      return formatted;
    default: {
      const exhaustive: never = definition.unit;
      return exhaustive;
    }
  }
}

export function benchmarkUnitLabel(definition: BenchmarkDefinition): string {
  switch (definition.unit) {
    case "percent":
      return "%";
    case "elo":
      return "Elo";
    case "score":
      return "score";
    default: {
      const exhaustive: never = definition.unit;
      return exhaustive;
    }
  }
}
