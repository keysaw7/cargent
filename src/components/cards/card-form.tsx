"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { deleteCardDraftAction, saveCardDraftAction } from "@/actions/cards";
import { GeneratedImageHistory } from "@/components/cards/generated-image-history";
import { LevelStarPicker } from "@/components/cards/level-star-picker";
import { ModelCategoryPicker } from "@/components/cards/model-category-picker";
import { TemplatePicker } from "@/components/cards/template-picker";
import { TradingCard } from "@/components/cards/trading-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldLimit, fieldLengthState } from "@/components/ui/field-limit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import {
  EFFORT_LABELS,
  EFFORT_LEVELS,
  firstMonotonicViolation,
  hasAnyEffort,
} from "@/lib/benchmark-efforts";
import {
  emptyBenchmarksFor,
  formBenchmarkEfforts,
  formBenchmarkHasScore,
  getCardFormValues,
  type CardFormAbility,
  type CardFormBenchmark,
} from "@/lib/card-draft";
import {
  CARD_DRAFT_AUTOSAVE_MS,
  IMAGE_GENERATION_HISTORY_LIMIT,
  MAX_ABILITIES,
  MAX_ABILITY_DESCRIPTION,
  MAX_ABILITY_NAME,
  MAX_ABILITY_POWER,
  MAX_CARD_NAME,
  MAX_DESCRIPTION,
  MAX_IMAGE_PROMPT_LENGTH,
  MAX_PROVIDER,
  MAX_SHORT_DESCRIPTION,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MIN_ABILITY_NAME,
  MIN_ABILITY_POWER,
  MIN_CARD_NAME,
  MIN_SHORT_DESCRIPTION,
  MIN_TAG_LENGTH,
  type CardKind,
  type CardTemplate,
} from "@/lib/constants";
import { publicStorageUrl } from "@/lib/env";
import {
  benchmarkUnitLabel,
  getBenchmarkDefinition,
  getBenchmarkPreset,
  MAX_BENCHMARK_VERSION,
  MAX_SOURCE_URL,
  type ModelCategory,
} from "@/lib/model-benchmarks";
import { emptyCardFormPricing, formPricingHasValue, formPricingToView } from "@/lib/model-pricing";
import { CARD_BUCKET, cardArtPath, validateImageFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { httpsUrlSchema, publishedBenchmarkSchema } from "@/lib/validations/card";
import type { CardDraft } from "@/types/database";
import type { CardWithAbilities, ImageGenerationPreview } from "@/types/models";

const emptyAbility: CardFormAbility = { name: "", description: "", power: 50 };

function AdvancedFields({
  initiallyOpen,
  children,
}: {
  initiallyOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <details className="group rounded-md border border-gold/10" open={open}>
      <summary
        className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          setOpen((current) => !current);
        }}
      >
        Avancé
      </summary>
      {children}
    </details>
  );
}

export function CardForm({
  collectionId,
  card,
  draft,
  generations: initialGenerations = [],
  action,
  submitLabel,
}: {
  collectionId: string;
  card?: CardWithAbilities;
  draft?: CardDraft | null;
  generations?: ImageGenerationPreview[];
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const initial = getCardFormValues(card, draft);
  const [name, setName] = useState(initial.name);
  const [kind, setKind] = useState<CardKind>(initial.kind);
  const [template, setTemplate] = useState<CardTemplate>(initial.template);
  const [provider, setProvider] = useState(initial.provider);
  const [level, setLevel] = useState(initial.level);
  const [shortDescription, setShortDescription] = useState(initial.shortDescription);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.tags);
  const [abilities, setAbilities] = useState<CardFormAbility[]>(initial.abilities);
  const [modelCategory, setModelCategory] = useState<ModelCategory | null>(initial.modelCategory);
  const [benchmarks, setBenchmarks] = useState(initial.benchmarks);
  const [pricing, setPricing] = useState(initial.pricing);
  const [imagePath, setImagePath] = useState(initial.imagePath);
  const [previewUrl, setPreviewUrl] = useState(publicStorageUrl(initial.imagePath));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState(initial.generatePrompt);
  const [generating, setGenerating] = useState(false);
  const [publish, setPublish] = useState(initial.isPublished);
  const [generations, setGenerations] = useState(initialGenerations);
  const [hasDraft, setHasDraft] = useState(Boolean(draft));
  const skipSaveRef = useRef(true);

  const preview = useMemo(
    () => ({
      name: name || "Sans nom",
      kind,
      template,
      level,
      shortDescription: shortDescription || "Ajoute un résumé pour la carte.",
      provider,
      imageUrl: previewUrl,
      abilities: abilities
        .filter((ability) => ability.name.trim().length > 0)
        .map((ability) => ({ name: ability.name, power: ability.power })),
      modelCategory: kind === "model" ? modelCategory : null,
      benchmarks:
        kind === "model"
          ? benchmarks.flatMap((benchmark) => {
              const efforts = formBenchmarkEfforts(benchmark);
              return hasAnyEffort(efforts) ? [{ key: benchmark.key, efforts }] : [];
            })
          : [],
      pricing: kind === "model" && modelCategory ? formPricingToView(modelCategory, pricing) : null,
    }),
    [abilities, benchmarks, kind, level, modelCategory, name, previewUrl, pricing, provider, shortDescription, template],
  );

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );
  const namedAbilities = useMemo(
    () => abilities.filter((ability) => ability.name.trim().length > 0),
    [abilities],
  );
  const nameState = fieldLengthState(name.trim(), MAX_CARD_NAME, MIN_CARD_NAME);
  const providerState = fieldLengthState(provider.trim(), MAX_PROVIDER);
  const shortDescriptionState = fieldLengthState(
    shortDescription.trim(),
    MAX_SHORT_DESCRIPTION,
    MIN_SHORT_DESCRIPTION,
  );
  const descriptionState = fieldLengthState(description.trim(), MAX_DESCRIPTION);
  const tagsInvalid =
    tagList.length > MAX_TAGS || tagList.some((tag) => tag.length < MIN_TAG_LENGTH || tag.length > MAX_TAG_LENGTH);
  const abilitiesInvalid = namedAbilities.some(
    (ability) =>
      fieldLengthState(ability.name.trim(), MAX_ABILITY_NAME, MIN_ABILITY_NAME).invalid ||
      fieldLengthState(ability.description.trim(), MAX_ABILITY_DESCRIPTION).invalid ||
      ability.power < MIN_ABILITY_POWER ||
      ability.power > MAX_ABILITY_POWER,
  );
  const scoredBenchmarks = benchmarks.flatMap((benchmark) => {
    const efforts = formBenchmarkEfforts(benchmark);
    if (!hasAnyEffort(efforts)) {
      return [];
    }
    return [
      {
        key: benchmark.key,
        low: efforts.low,
        medium: efforts.medium,
        high: efforts.high,
        xhigh: efforts.xhigh,
        version: benchmark.version.trim(),
        sourceUrl: benchmark.sourceUrl.trim(),
        measuredAt: benchmark.measuredAt.trim(),
      },
    ];
  });
  const benchmarksInvalid =
    kind === "model" &&
    (!modelCategory ||
      scoredBenchmarks.some((benchmark) => {
        const parsed = publishedBenchmarkSchema.safeParse(benchmark);
        if (!parsed.success || !modelCategory) {
          return true;
        }
        const definition = getBenchmarkDefinition(modelCategory, parsed.data.key);
        if (!definition) {
          return true;
        }
        return EFFORT_LEVELS.some((level) => {
          const score = parsed.data[level];
          return score != null && (score < definition.domain.min || score > definition.domain.max);
        });
      }));
  const pricingActive = kind === "model" && formPricingHasValue(pricing, modelCategory);
  const pricingInvalid =
    pricingActive &&
    ((modelCategory === "code" &&
      (!pricing.inputUsdPerMillion.trim() ||
        !pricing.outputUsdPerMillion.trim() ||
        !Number.isFinite(Number(pricing.inputUsdPerMillion)) ||
        !Number.isFinite(Number(pricing.outputUsdPerMillion)) ||
        Number(pricing.inputUsdPerMillion) < 0 ||
        Number(pricing.outputUsdPerMillion) < 0)) ||
      (modelCategory === "image" &&
        (!pricing.imageUsd.trim() || !Number.isFinite(Number(pricing.imageUsd)) || Number(pricing.imageUsd) < 0)) ||
      (modelCategory === "video" &&
        (!pricing.videoSecondUsd.trim() ||
          !Number.isFinite(Number(pricing.videoSecondUsd)) ||
          Number(pricing.videoSecondUsd) < 0)));
  const formInvalid =
    name.trim().length < MIN_CARD_NAME ||
    nameState.tooLong ||
    providerState.invalid ||
    shortDescription.trim().length < MIN_SHORT_DESCRIPTION ||
    shortDescriptionState.tooLong ||
    descriptionState.invalid ||
    tagsInvalid ||
    (kind === "agent" && abilitiesInvalid) ||
    (kind === "model" && (!modelCategory || benchmarksInvalid || pricingInvalid));

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      formData.set(
        "abilities",
        JSON.stringify(kind === "agent" ? abilities.filter((ability) => ability.name.trim()) : []),
      );
      formData.set("benchmarks", JSON.stringify(kind === "model" ? scoredBenchmarks : []));
      formData.set(
        "pricing",
        JSON.stringify(
          kind === "model" && pricingActive
            ? {
                inputUsdPerMillion: pricing.inputUsdPerMillion.trim()
                  ? Number(pricing.inputUsdPerMillion)
                  : null,
                outputUsdPerMillion: pricing.outputUsdPerMillion.trim()
                  ? Number(pricing.outputUsdPerMillion)
                  : null,
                imageUsd: pricing.imageUsd.trim() ? Number(pricing.imageUsd) : null,
                videoSecondUsd: pricing.videoSecondUsd.trim() ? Number(pricing.videoSecondUsd) : null,
              }
            : null,
        ),
      );
      formData.set("imagePath", imagePath ?? "");
      formData.set("isPublished", String(publish));
      formData.set("collectionId", collectionId);
      return action(formData);
    },
    null,
  );

  const draftPayload = useMemo(
    () => ({
      collectionId,
      cardId: card?.id ?? null,
      name,
      kind,
      template,
      provider,
      level,
      shortDescription,
      description,
      tags: tagList,
      abilities,
      modelCategory,
      benchmarks,
      pricing,
      imagePath,
      generatePrompt,
      isPublished: publish,
    }),
    [
      abilities,
      benchmarks,
      card?.id,
      collectionId,
      description,
      generatePrompt,
      imagePath,
      kind,
      level,
      modelCategory,
      name,
      pricing,
      provider,
      publish,
      shortDescription,
      tagList,
      template,
    ],
  );

  async function persistDraft(overrides?: Partial<typeof draftPayload>) {
    const result = await saveCardDraftAction({ ...draftPayload, ...overrides });
    if (result.ok) {
      setHasDraft(true);
    }
  }

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void saveCardDraftAction(draftPayload).then((result) => {
        if (result.ok) {
          setHasDraft(true);
        }
      });
    }, CARD_DRAFT_AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [draftPayload]);

  function applyFormValues(values: ReturnType<typeof getCardFormValues>) {
    setName(values.name);
    setKind(values.kind);
    setTemplate(values.template);
    setProvider(values.provider);
    setLevel(values.level);
    setShortDescription(values.shortDescription);
    setDescription(values.description);
    setTags(values.tags);
    setAbilities(values.abilities);
    setModelCategory(values.modelCategory);
    setBenchmarks(values.benchmarks);
    setPricing(values.pricing);
    setImagePath(values.imagePath);
    setPreviewUrl(publicStorageUrl(values.imagePath));
    setGeneratePrompt(values.generatePrompt);
    setPublish(values.isPublished);
  }

  async function onRestart() {
    skipSaveRef.current = true;
    await deleteCardDraftAction(collectionId, card?.id ?? null);
    applyFormValues(getCardFormValues(card));
    setHasDraft(false);
    setUploadError(null);
  }

  async function onFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploadError("Connexion requise pour ajouter une image.");
      return;
    }

    const path = cardArtPath(user.id, file);
    const { error } = await supabase.storage.from(CARD_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      setUploadError("Impossible d’envoyer l’image.");
      return;
    }

    setUploadError(null);
    setImagePath(path);
    setPreviewUrl(URL.createObjectURL(file));
    await persistDraft({ imagePath: path });
  }

  async function onGenerateImage() {
    if (generating || pending) {
      return;
    }

    setGenerating(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generatePrompt }),
      });
      const payload = (await response.json()) as ActionResult<{
        id: string;
        imagePath: string;
        imageUrl: string;
        prompt: string;
      }>;
      if (!payload.ok) {
        setUploadError(payload.error);
        return;
      }

      if (!payload.data) {
        setUploadError("Impossible de générer l’image.");
        return;
      }

      const generated = payload.data;
      setImagePath(generated.imagePath);
      setPreviewUrl(generated.imageUrl);
      setGenerations((current) =>
        [
          {
            id: generated.id,
            prompt: generated.prompt,
            imagePath: generated.imagePath,
            imageUrl: generated.imageUrl,
            createdAt: new Date().toISOString(),
          },
          ...current.filter((generation) => generation.id !== generated.id),
        ].slice(0, IMAGE_GENERATION_HISTORY_LIMIT),
      );
      await persistDraft({ imagePath: generated.imagePath, generatePrompt: generated.prompt });
    } catch {
      setUploadError("Impossible de générer l’image.");
    } finally {
      setGenerating(false);
    }
  }

  function onCategoryChange(next: ModelCategory) {
    const hasScores = benchmarks.some((benchmark) => formBenchmarkHasScore(benchmark));
    if (modelCategory && next !== modelCategory && hasScores) {
      const confirmed = window.confirm("Changer de catégorie remplace les scores saisis. Continuer ?");
      if (!confirmed) {
        return;
      }
    }
    setModelCategory(next);
    setBenchmarks(emptyBenchmarksFor(next));
    setPricing(emptyCardFormPricing());
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <FieldLimit htmlFor="name" label="Nom" value={name} min={MIN_CARD_NAME} max={MAX_CARD_NAME} />
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={MAX_CARD_NAME}
              aria-invalid={nameState.invalid || undefined}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kind">Type</Label>
            <select
              id="kind"
              name="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as CardKind)}
              className="h-10 w-full rounded-lg border border-input bg-obsidian px-2.5 text-sm"
            >
              <option value="agent">Agent</option>
              <option value="model">Modèle</option>
            </select>
          </div>
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="modelCategory" value={kind === "model" ? (modelCategory ?? "") : ""} />
          <div className="space-y-1.5">
            <FieldLimit htmlFor="provider" label="Fournisseur" value={provider} max={MAX_PROVIDER} />
            <Input
              id="provider"
              name="provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              maxLength={MAX_PROVIDER}
              aria-invalid={providerState.invalid || undefined}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="level">Niveau {level}</Label>
            <LevelStarPicker id="level" name="level" value={level} onChange={setLevel} />
          </div>
          {kind === "model" ? (
            <div className="space-y-1.5">
              <ModelCategoryPicker value={modelCategory} onChange={onCategoryChange} />
            </div>
          ) : null}
        </div>
        <TemplatePicker value={template} onChange={setTemplate} kind={kind} />
        <div className="space-y-1.5">
          <FieldLimit
            htmlFor="shortDescription"
            label="Résumé"
            value={shortDescription}
            min={MIN_SHORT_DESCRIPTION}
            max={MAX_SHORT_DESCRIPTION}
          />
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            required
            maxLength={MAX_SHORT_DESCRIPTION}
            aria-invalid={shortDescriptionState.invalid || undefined}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLimit htmlFor="description" label="Description" value={description} max={MAX_DESCRIPTION} />
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={MAX_DESCRIPTION}
            aria-invalid={descriptionState.invalid || undefined}
          />
        </div>
        {kind === "agent" ? (
        <fieldset className="space-y-3">
          <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-medium">
            <span>Capacités</span>
            <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">
              {namedAbilities.length}/{MAX_ABILITIES}
            </span>
          </legend>
          {abilities.map((ability, index) => {
            const abilityNameState = fieldLengthState(ability.name, MAX_ABILITY_NAME, MIN_ABILITY_NAME);
            const abilityDescriptionState = fieldLengthState(ability.description, MAX_ABILITY_DESCRIPTION);
            const powerInvalid = ability.power < MIN_ABILITY_POWER || ability.power > MAX_ABILITY_POWER;
            const canRemove =
              abilities.length > 1 || Boolean(ability.name.trim() || ability.description.trim());

            return (
              <div key={index} className="grid gap-2 rounded-lg border border-gold/15 p-3 sm:grid-cols-[1fr_90px]">
                {canRemove ? (
                  <div className="flex justify-end sm:col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = abilities.filter((_, abilityIndex) => abilityIndex !== index);
                        setAbilities(next.length > 0 ? next : [{ ...emptyAbility }]);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <FieldLimit
                    htmlFor={`ability-name-${index}`}
                    label="Nom"
                    value={ability.name}
                    min={ability.name.trim() ? MIN_ABILITY_NAME : 0}
                    max={MAX_ABILITY_NAME}
                  />
                  <Input
                    id={`ability-name-${index}`}
                    value={ability.name}
                    placeholder="Nom"
                    maxLength={MAX_ABILITY_NAME}
                    aria-invalid={abilityNameState.invalid || undefined}
                    onChange={(event) => {
                      const next = [...abilities];
                      next[index] = { ...ability, name: event.target.value };
                      setAbilities(next);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <Label htmlFor={`ability-power-${index}`}>Force</Label>
                    <p
                      className={cn(
                        "font-mono text-[11px] tabular-nums",
                        powerInvalid ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {MIN_ABILITY_POWER}–{MAX_ABILITY_POWER}
                    </p>
                  </div>
                  <Input
                    id={`ability-power-${index}`}
                    type="number"
                    min={MIN_ABILITY_POWER}
                    max={MAX_ABILITY_POWER}
                    value={ability.power}
                    aria-invalid={powerInvalid || undefined}
                    onChange={(event) => {
                      const next = [...abilities];
                      next[index] = { ...ability, power: Number(event.target.value) };
                      setAbilities(next);
                    }}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <FieldLimit
                    htmlFor={`ability-description-${index}`}
                    label="Effet"
                    value={ability.description}
                    max={MAX_ABILITY_DESCRIPTION}
                  />
                  <Textarea
                    id={`ability-description-${index}`}
                    value={ability.description}
                    placeholder="Ce que fait cette capacité"
                    maxLength={MAX_ABILITY_DESCRIPTION}
                    aria-invalid={abilityDescriptionState.invalid || undefined}
                    onChange={(event) => {
                      const next = [...abilities];
                      next[index] = { ...ability, description: event.target.value };
                      setAbilities(next);
                    }}
                  />
                </div>
              </div>
            );
          })}
          {abilities.length < MAX_ABILITIES ? (
            <Button type="button" variant="outline" onClick={() => setAbilities([...abilities, { ...emptyAbility }])}>
              Ajouter une capacité
            </Button>
          ) : null}
        </fieldset>
        ) : modelCategory ? (
        <div className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-medium">
              <span>Benchmarks</span>
              <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">
                {scoredBenchmarks.length}/{getBenchmarkPreset(modelCategory).length}
              </span>
            </legend>
            {benchmarks.map((benchmark, index) => {
              const definition = getBenchmarkDefinition(modelCategory, benchmark.key);
              if (!definition) {
                return null;
              }
              const efforts = formBenchmarkEfforts(benchmark);
              const monotonicViolation = firstMonotonicViolation(efforts);
              const versionState = fieldLengthState(benchmark.version, MAX_BENCHMARK_VERSION);
              const sourceFilled = benchmark.sourceUrl.trim().length > 0;
              const sourceInvalid = sourceFilled && httpsUrlSchema.safeParse(benchmark.sourceUrl).success === false;
              const dateFilled = benchmark.measuredAt.trim().length > 0;
              const dateInvalid = dateFilled && !/^\d{4}-\d{2}-\d{2}$/.test(benchmark.measuredAt);
              const hasAdvanced =
                benchmark.version.trim().length > 0 || sourceFilled || dateFilled;

              function updateBenchmark(patch: Partial<CardFormBenchmark>) {
                const next = [...benchmarks];
                next[index] = { ...benchmark, ...patch };
                setBenchmarks(next);
              }

              return (
                <div key={benchmark.key} className="space-y-3 rounded-lg border border-gold/15 p-3">
                  <div>
                    <p className="text-sm font-medium">{definition.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{definition.description}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">
                          Efforts ({benchmarkUnitLabel(definition)})
                        </p>
                        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                          {definition.domain.min}–{definition.domain.max}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {EFFORT_LEVELS.map((level) => {
                          const fieldId = `benchmark-${level}-${index}`;
                          const raw = benchmark[level];
                          const parsed = efforts[level];
                          const domainInvalid =
                            parsed != null &&
                            (!Number.isFinite(parsed) ||
                              parsed < definition.domain.min ||
                              parsed > definition.domain.max);
                          const orderInvalid = monotonicViolation === level;
                          const invalid = domainInvalid || orderInvalid;
                          return (
                            <div key={level} className="space-y-1.5">
                              <Label htmlFor={fieldId}>{EFFORT_LABELS[level]}</Label>
                              <Input
                                id={fieldId}
                                type="number"
                                step="any"
                                min={definition.domain.min}
                                max={definition.domain.max}
                                value={raw}
                                aria-invalid={invalid || undefined}
                                onChange={(event) => updateBenchmark({ [level]: event.target.value })}
                              />
                              {domainInvalid ? (
                                <p className="text-[11px] text-destructive">
                                  Entre {definition.domain.min} et {definition.domain.max}.
                                </p>
                              ) : null}
                              {orderInvalid ? (
                                <p className="text-[11px] text-destructive">
                                  Les efforts renseignés doivent être croissants.
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <AdvancedFields initiallyOpen={hasAdvanced}>
                      <div className="grid gap-3 border-t border-gold/10 p-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <FieldLimit
                            htmlFor={`benchmark-version-${index}`}
                            label="Version"
                            value={benchmark.version}
                            max={MAX_BENCHMARK_VERSION}
                          />
                          <Input
                            id={`benchmark-version-${index}`}
                            value={benchmark.version}
                            placeholder="ex. 2026-08"
                            maxLength={MAX_BENCHMARK_VERSION}
                            aria-invalid={versionState.invalid || undefined}
                            onChange={(event) => updateBenchmark({ version: event.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <FieldLimit
                            htmlFor={`benchmark-source-${index}`}
                            label="Source"
                            value={benchmark.sourceUrl}
                            max={MAX_SOURCE_URL}
                          />
                          <Input
                            id={`benchmark-source-${index}`}
                            type="url"
                            value={benchmark.sourceUrl}
                            placeholder="https://"
                            maxLength={MAX_SOURCE_URL}
                            aria-invalid={sourceInvalid || undefined}
                            onChange={(event) => updateBenchmark({ sourceUrl: event.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor={`benchmark-date-${index}`}>Date de mesure</Label>
                          <Input
                            id={`benchmark-date-${index}`}
                            type="date"
                            value={benchmark.measuredAt}
                            aria-invalid={dateInvalid || undefined}
                            onChange={(event) => updateBenchmark({ measuredAt: event.target.value })}
                          />
                        </div>
                      </div>
                    </AdvancedFields>
                  </div>
                </div>
              );
            })}
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Tarification</legend>
            <p className="text-xs text-muted-foreground">Optionnel. Les champs vides n’apparaissent pas sur la carte.</p>
            {modelCategory === "code" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="price-input">Input USD / 1M tokens</Label>
                  <Input
                    id="price-input"
                    type="number"
                    min={0}
                    step="any"
                    value={pricing.inputUsdPerMillion}
                    onChange={(event) => setPricing({ ...pricing, inputUsdPerMillion: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price-output">Output USD / 1M tokens</Label>
                  <Input
                    id="price-output"
                    type="number"
                    min={0}
                    step="any"
                    value={pricing.outputUsdPerMillion}
                    onChange={(event) => setPricing({ ...pricing, outputUsdPerMillion: event.target.value })}
                  />
                </div>
              </div>
            ) : null}
            {modelCategory === "image" ? (
              <div className="space-y-1.5">
                <Label htmlFor="price-image">USD par image</Label>
                <Input
                  id="price-image"
                  type="number"
                  min={0}
                  step="any"
                  value={pricing.imageUsd}
                  onChange={(event) => setPricing({ ...pricing, imageUsd: event.target.value })}
                />
              </div>
            ) : null}
            {modelCategory === "video" ? (
              <div className="space-y-1.5">
                <Label htmlFor="price-video">USD par seconde</Label>
                <Input
                  id="price-video"
                  type="number"
                  min={0}
                  step="any"
                  value={pricing.videoSecondUsd}
                  onChange={(event) => setPricing({ ...pricing, videoSecondUsd: event.target.value })}
                />
              </div>
            ) : null}
          </fieldset>
        </div>
        ) : (
          <p className="rounded-lg border border-gold/20 px-3 py-3 text-sm text-muted-foreground">
            Choisis une catégorie pour afficher les benchmarks associés.
          </p>
        )}
        {hasDraft ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-gold/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Brouillon enregistré</p>
            <Button type="button" variant="ghost" size="sm" disabled={generating || pending} onClick={() => void onRestart()}>
              Recommencer
            </Button>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={generating || pending}
              onChange={(event) => void onFileChange(event.target.files?.[0])}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLimit
              htmlFor="generatePrompt"
              label="Prompt de génération"
              value={generatePrompt}
              max={MAX_IMAGE_PROMPT_LENGTH}
            />
            <Textarea
              id="generatePrompt"
              value={generatePrompt}
              onChange={(event) => setGeneratePrompt(event.target.value)}
              disabled={generating || pending}
              maxLength={MAX_IMAGE_PROMPT_LENGTH}
              aria-invalid={generatePrompt.length > MAX_IMAGE_PROMPT_LENGTH || undefined}
              placeholder="Portrait 4:3 d’un agent IA, illustration de carte collectible…"
            />
            <Button type="button" variant="outline" disabled={generating || pending} onClick={() => void onGenerateImage()}>
              {generating ? "Génération…" : "Générer l’image"}
            </Button>
          </div>
          <GeneratedImageHistory
            generations={generations}
            selectedPath={imagePath}
            disabled={generating || pending}
            onSelect={(generation) => {
              setImagePath(generation.imagePath);
              setPreviewUrl(generation.imageUrl);
              setGeneratePrompt(generation.prompt);
            }}
          />
          {uploadError ? <p className="text-sm text-destructive sm:col-span-2">{uploadError}</p> : null}
        </div>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-gold/20 px-3 py-3">
          <span>
            <span className="block text-sm font-medium">Publier</span>
            <span className="text-xs text-muted-foreground">Une carte brouillon reste dans ton classeur.</span>
          </span>
          <input
            type="checkbox"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
            className="size-4 accent-gold"
          />
        </label>
        {state && !state.ok ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={pending || generating || formInvalid} className="h-10">
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </form>
      <aside className="lg:sticky lg:top-24">
        <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-gold uppercase">Aperçu</p>
        <TradingCard card={preview} size="md" />
      </aside>
    </div>
  );
}
