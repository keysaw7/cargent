import { NextResponse } from "next/server";

import { generationFailureStatus } from "@/lib/image-generation-errors";
import { generateCardArt } from "@/lib/image-generation";
import { getCurrentUserId } from "@/lib/queries/auth";
import { generateImageSchema } from "@/lib/validations/generate-image";

export const maxDuration = 60;

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Connexion requise pour générer une image." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const parsed = generateImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Prompt invalide." },
      { status: 400 },
    );
  }

  const result = await generateCardArt(userId, parsed.data.prompt);
  if (!result.ok) {
    return NextResponse.json(result, { status: generationFailureStatus(result.error) });
  }

  return NextResponse.json(result);
}
