"use client";

import { useActionState, useMemo, useState } from "react";

import { TemplatePicker } from "@/components/cards/template-picker";
import { TradingCard } from "@/components/cards/trading-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { resolveCardTemplate } from "@/lib/card-templates";
import { DEFAULT_CARD_TEMPLATE, MAX_ABILITIES, MAX_LEVEL, MIN_LEVEL, type CardKind, type CardTemplate } from "@/lib/constants";
import { publicStorageUrl } from "@/lib/env";
import { CARD_BUCKET, cardArtPath, validateImageFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { CardAbility } from "@/types/database";
import type { CardWithAbilities } from "@/types/models";

type AbilityDraft = {
  name: string;
  description: string;
  power: number;
};

const emptyAbility: AbilityDraft = { name: "", description: "", power: 50 };

export function CardForm({
  collectionId,
  card,
  action,
  submitLabel,
}: {
  collectionId: string;
  card?: CardWithAbilities;
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [name, setName] = useState(card?.name ?? "");
  const [kind, setKind] = useState<CardKind>(card?.kind ?? "agent");
  const [template, setTemplate] = useState<CardTemplate>(
    card ? resolveCardTemplate(card.template) : DEFAULT_CARD_TEMPLATE,
  );
  const [provider, setProvider] = useState(card?.provider ?? "");
  const [level, setLevel] = useState(card?.level ?? 4);
  const [shortDescription, setShortDescription] = useState(card?.short_description ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [tags, setTags] = useState((card?.tags ?? []).join(", "));
  const [abilities, setAbilities] = useState<AbilityDraft[]>(
    card?.card_abilities.length
      ? [...card.card_abilities]
          .sort((a, b) => a.position - b.position)
          .map((ability: CardAbility) => ({
            name: ability.name,
            description: ability.description,
            power: ability.power,
          }))
      : [{ ...emptyAbility }],
  );
  const [imagePath, setImagePath] = useState(card?.image_path ?? null);
  const [previewUrl, setPreviewUrl] = useState(publicStorageUrl(card?.image_path));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [publish, setPublish] = useState(card?.is_published ?? true);

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
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} required className="h-10" />
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
            <Label htmlFor="provider">Fournisseur</Label>
            <Input id="provider" name="provider" value={provider} onChange={(event) => setProvider(event.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level">Niveau ({MIN_LEVEL}–{MAX_LEVEL})</Label>
            <Input
              id="level"
              name="level"
              type="number"
              min={MIN_LEVEL}
              max={MAX_LEVEL}
              value={level}
              onChange={(event) => setLevel(Number(event.target.value))}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="recherche, code, voix"
              className="h-10"
            />
          </div>
        </div>
        <TemplatePicker value={template} onChange={setTemplate} kind={kind} />
        <div className="space-y-1.5">
          <Label htmlFor="shortDescription">Résumé</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Capacités</legend>
          {abilities.map((ability, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-gold/15 p-3 sm:grid-cols-[1fr_90px]">
              <Input
                value={ability.name}
                placeholder="Nom"
                onChange={(event) => {
                  const next = [...abilities];
                  next[index] = { ...ability, name: event.target.value };
                  setAbilities(next);
                }}
              />
              <Input
                type="number"
                min={1}
                max={100}
                value={ability.power}
                onChange={(event) => {
                  const next = [...abilities];
                  next[index] = { ...ability, power: Number(event.target.value) };
                  setAbilities(next);
                }}
              />
              <Textarea
                className="sm:col-span-2"
                value={ability.description}
                placeholder="Ce que fait cette capacité"
                onChange={(event) => {
                  const next = [...abilities];
                  next[index] = { ...ability, description: event.target.value };
                  setAbilities(next);
                }}
              />
            </div>
          ))}
          {abilities.length < MAX_ABILITIES ? (
            <Button type="button" variant="outline" onClick={() => setAbilities([...abilities, { ...emptyAbility }])}>
              Ajouter une capacité
            </Button>
          ) : null}
        </fieldset>
        <div className="space-y-1.5">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void onFileChange(event.target.files?.[0])}
          />
          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
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
        <Button type="submit" disabled={pending} className="h-10">
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
