"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { deleteCardDraftAction, saveCardDraftAction } from "@/actions/cards";
import { GeneratedImageHistory } from "@/components/cards/generated-image-history";
import { LevelStarPicker } from "@/components/cards/level-star-picker";
import { TemplatePicker } from "@/components/cards/template-picker";
import { TradingCard } from "@/components/cards/trading-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldLimit, fieldLengthState } from "@/components/ui/field-limit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { getCardFormValues, type CardFormAbility } from "@/lib/card-draft";
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
import { CARD_BUCKET, cardArtPath, validateImageFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CardDraft } from "@/types/database";
import type { CardWithAbilities, ImageGenerationPreview } from "@/types/models";

const emptyAbility: CardFormAbility = { name: "", description: "", power: 50 };

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
    }),
    [abilities, kind, level, name, previewUrl, provider, shortDescription, template],
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
  const formInvalid =
    name.trim().length < MIN_CARD_NAME ||
    nameState.tooLong ||
    providerState.invalid ||
    shortDescription.trim().length < MIN_SHORT_DESCRIPTION ||
    shortDescriptionState.tooLong ||
    descriptionState.invalid ||
    tagsInvalid ||
    abilitiesInvalid;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      formData.set("abilities", JSON.stringify(abilities.filter((ability) => ability.name.trim())));
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
      imagePath,
      generatePrompt,
      isPublished: publish,
    }),
    [
      abilities,
      card?.id,
      collectionId,
      description,
      generatePrompt,
      imagePath,
      kind,
      level,
      name,
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
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="tags">Tags</Label>
              <p
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  tagsInvalid ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {tagList.length}/{MAX_TAGS}
                {tagList.some((tag) => tag.length > MAX_TAG_LENGTH)
                  ? ` · max ${MAX_TAG_LENGTH} car.`
                  : ` · ${MAX_TAG_LENGTH} car./tag`}
              </p>
            </div>
            <Input
              id="tags"
              name="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="recherche, code, voix"
              aria-invalid={tagsInvalid || undefined}
              className="h-10"
            />
          </div>
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
        <TradingCard card={preview} />
      </aside>
    </div>
  );
}
