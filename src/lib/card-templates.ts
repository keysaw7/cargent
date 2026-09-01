import {
  CARD_TEMPLATES,
  DEFAULT_CARD_TEMPLATE,
  type CardTemplate,
} from "@/lib/constants";

export type CardTemplateDecoration = "none" | "halo" | "scanlines" | "binder" | "parchment";

export type CardTemplateStyle = {
  id: CardTemplate;
  label: string;
  description: string;
  outerRadius: string;
  innerRadius: string;
  frameClass: string;
  framePadding: string;
  innerClass: string;
  accentClass: string;
  kindClass: string;
  titleClass: string;
  levelClass: string;
  bodyClass: string;
  imageWrapClass: string;
  imagePlaceholderClass: string;
  providerClass: string;
  abilityRowClass: string;
  abilityNameClass: string;
  abilityPowerClass: string;
  starFilledClass: string;
  starEmptyClass: string;
  foilClass: string;
  foilOpacity: number;
  decoration: CardTemplateDecoration;
  doubleRing: boolean;
};

export const CARD_TEMPLATE_STYLES: Record<CardTemplate, CardTemplateStyle> = {
  classique: {
    id: "classique",
    label: "Classique",
    description: "Cadre dégradé et hiérarchie habituelle du classeur.",
    outerRadius: "rounded-[18px]",
    innerRadius: "rounded-[16px]",
    frameClass: "bg-gradient-to-br from-holo/50 via-gold/40 to-arcane/60 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
    framePadding: "p-[2px]",
    innerClass: "bg-nocturne",
    accentClass: "text-holo",
    kindClass: "font-mono text-[10px] tracking-[0.22em] uppercase",
    titleClass: "font-display text-[1.35rem] leading-none text-ivory",
    levelClass: "font-mono text-xs text-gold",
    bodyClass: "text-sm leading-snug text-ivory/85",
    imageWrapClass: "overflow-hidden rounded-sm border border-gold/30 bg-obsidian",
    imagePlaceholderClass:
      "bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--arcane)_40%,transparent),transparent_55%),#090b14]",
    providerClass: "bg-obsidian/80 px-1.5 font-mono text-[10px] tracking-wider text-ivory uppercase",
    abilityRowClass: "border-t border-gold/20",
    abilityNameClass: "text-xs text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-gold",
    starFilledClass: "text-gold",
    starEmptyClass: "text-gold/25",
    foilClass: "foil-sheen",
    foilOpacity: 0.55,
    decoration: "none",
    doubleRing: false,
  },
  signal: {
    id: "signal",
    label: "Signal",
    description: "Accent cyan, coins nets et labels mono.",
    outerRadius: "rounded-[8px]",
    innerRadius: "rounded-[6px]",
    frameClass: "bg-gradient-to-br from-holo via-arcane to-holo/40 shadow-[0_16px_40px_rgba(52,87,213,0.35)]",
    framePadding: "p-[2px]",
    innerClass: "bg-[#061018]",
    accentClass: "text-holo",
    kindClass: "font-mono text-[10px] tracking-[0.32em] uppercase",
    titleClass: "font-sans text-[1.05rem] leading-none font-medium tracking-wide text-ivory uppercase",
    levelClass: "font-mono text-xs text-holo",
    bodyClass: "font-mono text-[12px] leading-snug text-holo/80",
    imageWrapClass: "overflow-hidden rounded-[2px] border border-holo/45 bg-obsidian",
    imagePlaceholderClass:
      "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--holo)_18%,transparent),transparent_40%),#061018]",
    providerClass: "border border-holo/40 bg-[#061018]/90 px-1.5 font-mono text-[10px] tracking-[0.18em] text-holo uppercase",
    abilityRowClass: "border-t border-holo/20",
    abilityNameClass: "font-mono text-[11px] text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-holo",
    starFilledClass: "text-holo",
    starEmptyClass: "text-holo/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.4,
    decoration: "none",
    doubleRing: false,
  },
  reflet: {
    id: "reflet",
    label: "Reflet",
    description: "Foil or et ivoire, éclat de modèle rare.",
    outerRadius: "rounded-[20px]",
    innerRadius: "rounded-[18px]",
    frameClass: "bg-gradient-to-br from-gold via-ivory/70 to-gold/30 shadow-[0_20px_48px_rgba(214,169,74,0.28)]",
    framePadding: "p-[3px]",
    innerClass: "bg-[#1a1408]",
    accentClass: "text-gold",
    kindClass: "font-mono text-[10px] tracking-[0.26em] uppercase",
    titleClass: "font-display text-[1.45rem] leading-none text-ivory",
    levelClass: "font-mono text-xs text-gold",
    bodyClass: "text-sm leading-snug text-ivory/90",
    imageWrapClass: "overflow-hidden rounded-md border border-gold/50 bg-obsidian",
    imagePlaceholderClass:
      "bg-[radial-gradient(circle_at_70%_20%,color-mix(in_oklab,var(--gold)_35%,transparent),transparent_55%),#1a1408]",
    providerClass: "bg-gold/90 px-1.5 font-mono text-[10px] tracking-wider text-obsidian uppercase",
    abilityRowClass: "border-t border-gold/30",
    abilityNameClass: "text-xs text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-gold",
    starFilledClass: "text-gold",
    starEmptyClass: "text-gold/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.75,
    decoration: "none",
    doubleRing: false,
  },
  grimoire: {
    id: "grimoire",
    label: "Grimoire",
    description: "Page ivoire, titres display et coins doux.",
    outerRadius: "rounded-[22px]",
    innerRadius: "rounded-[20px]",
    frameClass: "bg-gradient-to-br from-ivory/50 via-gold/35 to-ivory/15 shadow-[0_18px_44px_rgba(0,0,0,0.4)]",
    framePadding: "p-[2px]",
    innerClass: "bg-[#1c1710]",
    accentClass: "text-gold",
    kindClass: "font-display text-[13px] tracking-[0.18em] uppercase",
    titleClass: "font-display text-[1.6rem] leading-none text-ivory",
    levelClass: "font-display text-sm text-gold",
    bodyClass: "text-sm leading-relaxed text-ivory/90 italic",
    imageWrapClass: "overflow-hidden rounded-lg border border-ivory/25 bg-[#140f0a]",
    imagePlaceholderClass:
      "bg-[radial-gradient(ellipse_at_20%_10%,color-mix(in_oklab,var(--ivory)_18%,transparent),transparent_55%),#140f0a]",
    providerClass: "bg-[#1c1710]/90 px-2 font-display text-[11px] tracking-wider text-gold uppercase",
    abilityRowClass: "border-t border-ivory/15",
    abilityNameClass: "font-display text-sm text-ivory",
    abilityPowerClass: "font-display text-sm text-gold",
    starFilledClass: "text-gold",
    starEmptyClass: "text-ivory/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.28,
    decoration: "parchment",
    doubleRing: false,
  },
  terminal: {
    id: "terminal",
    label: "Terminal",
    description: "Fond obsidian, scanlines et vibe CLI.",
    outerRadius: "rounded-[2px]",
    innerRadius: "rounded-[1px]",
    frameClass: "bg-holo/40 shadow-[0_0_24px_rgba(102,227,255,0.18)]",
    framePadding: "p-px",
    innerClass: "bg-obsidian",
    accentClass: "text-holo",
    kindClass: "font-mono text-[10px] tracking-[0.28em] uppercase",
    titleClass: "font-mono text-[0.95rem] leading-none text-holo",
    levelClass: "font-mono text-[11px] text-holo/80",
    bodyClass: "font-mono text-[11px] leading-relaxed text-holo/75",
    imageWrapClass: "overflow-hidden rounded-none border border-holo/25 bg-black",
    imagePlaceholderClass: "bg-[linear-gradient(180deg,#0b1a1c,transparent_50%),#05080c]",
    providerClass: "border border-holo/30 bg-black/80 px-1.5 font-mono text-[10px] text-holo uppercase",
    abilityRowClass: "border-t border-dashed border-holo/25",
    abilityNameClass: "font-mono text-[11px] text-holo/90",
    abilityPowerClass: "font-mono text-[11px] text-holo",
    starFilledClass: "text-holo",
    starEmptyClass: "text-holo/15",
    foilClass: "foil-sheen",
    foilOpacity: 0.22,
    decoration: "scanlines",
    doubleRing: false,
  },
  arcane: {
    id: "arcane",
    label: "Arcane",
    description: "Dégradé profond et halo radial sur l’image.",
    outerRadius: "rounded-[16px]",
    innerRadius: "rounded-[14px]",
    frameClass: "bg-gradient-to-br from-arcane via-holo/25 to-arcane/80 shadow-[0_18px_50px_rgba(52,87,213,0.45)]",
    framePadding: "p-[2px]",
    innerClass: "bg-[#0a1028]",
    accentClass: "text-holo",
    kindClass: "font-mono text-[10px] tracking-[0.24em] uppercase",
    titleClass: "font-display text-[1.4rem] leading-none tracking-wide text-ivory",
    levelClass: "font-mono text-xs text-holo",
    bodyClass: "text-sm leading-snug text-ivory/80",
    imageWrapClass: "overflow-hidden rounded-md border border-arcane/50 bg-[#070b1c]",
    imagePlaceholderClass:
      "bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--arcane)_55%,transparent),transparent_58%),#070b1c]",
    providerClass: "bg-arcane/80 px-1.5 font-mono text-[10px] tracking-wider text-ivory uppercase",
    abilityRowClass: "border-t border-arcane/35",
    abilityNameClass: "text-xs text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-holo",
    starFilledClass: "text-holo",
    starEmptyClass: "text-arcane/50",
    foilClass: "foil-sheen",
    foilOpacity: 0.48,
    decoration: "halo",
    doubleRing: false,
  },
  obsidienne: {
    id: "obsidienne",
    label: "Obsidienne",
    description: "Minimal, contraste élevé, sans cadre dégradé.",
    outerRadius: "rounded-[4px]",
    innerRadius: "rounded-[3px]",
    frameClass: "hairline bg-ivory/15",
    framePadding: "p-px",
    innerClass: "bg-obsidian",
    accentClass: "text-ivory",
    kindClass: "font-sans text-[10px] tracking-[0.2em] uppercase",
    titleClass: "font-sans text-[1.15rem] leading-none font-medium text-ivory",
    levelClass: "font-mono text-xs text-ivory/70",
    bodyClass: "text-sm leading-snug text-ivory/75",
    imageWrapClass: "overflow-hidden rounded-none border border-ivory/15 bg-black",
    imagePlaceholderClass: "bg-[#0b0d14]",
    providerClass: "border border-ivory/20 bg-obsidian/90 px-1.5 font-mono text-[10px] text-ivory uppercase",
    abilityRowClass: "border-t border-ivory/10",
    abilityNameClass: "text-xs text-ivory/90",
    abilityPowerClass: "font-mono text-[11px] text-ivory",
    starFilledClass: "text-ivory",
    starEmptyClass: "text-ivory/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.12,
    decoration: "none",
    doubleRing: false,
  },
  classeur: {
    id: "classeur",
    label: "Classeur",
    description: "Texture de grille et cadre or discret.",
    outerRadius: "rounded-[6px]",
    innerRadius: "rounded-[4px]",
    frameClass: "bg-gradient-to-br from-gold/50 via-gold/15 to-gold/30 shadow-[0_14px_32px_rgba(0,0,0,0.4)]",
    framePadding: "p-[2px]",
    innerClass: "bg-nocturne",
    accentClass: "text-gold",
    kindClass: "font-mono text-[10px] tracking-[0.2em] uppercase",
    titleClass: "font-display text-[1.3rem] leading-none text-ivory",
    levelClass: "font-mono text-xs text-gold",
    bodyClass: "text-sm leading-snug text-ivory/85",
    imageWrapClass: "overflow-hidden rounded-sm border border-gold/25 bg-obsidian",
    imagePlaceholderClass:
      "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_45%),#12182c]",
    providerClass: "bg-nocturne/90 px-1.5 font-mono text-[10px] tracking-wider text-gold uppercase",
    abilityRowClass: "border-t border-gold/15",
    abilityNameClass: "text-xs text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-gold",
    starFilledClass: "text-gold",
    starEmptyClass: "text-gold/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.3,
    decoration: "binder",
    doubleRing: false,
  },
  relique: {
    id: "relique",
    label: "Relique",
    description: "Double bordure et badge fournisseur mis en avant.",
    outerRadius: "rounded-[14px]",
    innerRadius: "rounded-[10px]",
    frameClass: "bg-gradient-to-br from-gold via-[#8a5a12] to-gold shadow-[0_20px_46px_rgba(138,90,18,0.35)]",
    framePadding: "p-[3px]",
    innerClass: "bg-[#140f08]",
    accentClass: "text-gold",
    kindClass: "font-mono text-[10px] tracking-[0.26em] uppercase",
    titleClass: "font-display text-[1.45rem] leading-none text-ivory",
    levelClass: "font-mono text-xs text-gold",
    bodyClass: "text-sm leading-snug text-ivory/88",
    imageWrapClass: "overflow-hidden rounded-sm border-2 border-gold/60 bg-obsidian",
    imagePlaceholderClass:
      "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--gold)_28%,transparent),transparent_50%),#140f08]",
    providerClass: "bg-gold px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-obsidian uppercase",
    abilityRowClass: "border-t border-gold/25",
    abilityNameClass: "text-xs text-ivory",
    abilityPowerClass: "font-mono text-[11px] text-gold",
    starFilledClass: "text-gold",
    starEmptyClass: "text-gold/20",
    foilClass: "foil-sheen",
    foilOpacity: 0.45,
    decoration: "none",
    doubleRing: true,
  },
};

export function isCardTemplate(value: unknown): value is CardTemplate {
  return typeof value === "string" && (CARD_TEMPLATES as readonly string[]).includes(value);
}

export function resolveCardTemplate(value: unknown): CardTemplate {
  return isCardTemplate(value) ? value : DEFAULT_CARD_TEMPLATE;
}

export function getCardTemplateStyle(value: unknown): CardTemplateStyle {
  return CARD_TEMPLATE_STYLES[resolveCardTemplate(value)];
}

export function cardTemplateLabel(template: CardTemplate): string {
  switch (template) {
    case "classique":
    case "signal":
    case "reflet":
    case "grimoire":
    case "terminal":
    case "arcane":
    case "obsidienne":
    case "classeur":
    case "relique":
      return CARD_TEMPLATE_STYLES[template].label;
    default: {
      const exhaustive: never = template;
      return exhaustive;
    }
  }
}
