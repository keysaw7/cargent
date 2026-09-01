import { IMAGE_GENERATION_HISTORY_LIMIT } from "@/lib/constants";
import { publicStorageUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ImageGenerationPreview } from "@/types/models";

export async function listMyImageGenerations(
  userId: string,
  limit = IMAGE_GENERATION_HISTORY_LIMIT,
): Promise<ImageGenerationPreview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("image_generations")
    .select("id, prompt, image_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []).flatMap((row) => {
    const imageUrl = publicStorageUrl(row.image_path);
    if (!imageUrl) {
      return [];
    }

    return [
      {
        id: row.id,
        prompt: row.prompt,
        imagePath: row.image_path,
        imageUrl,
        createdAt: row.created_at,
      },
    ];
  });
}