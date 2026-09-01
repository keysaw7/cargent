import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  CARD_BUCKET,
  MAX_IMAGE_BYTES,
} from "@/lib/constants";

export function fileExtension(file: File): (typeof ALLOWED_IMAGE_EXTENSIONS)[number] | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "jpeg" || fromName === "jpg" || fromName === "png" || fromName === "webp") {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Utilise un JPEG, un PNG ou un WebP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "L’image dépasse 5 Mo.";
  }

  if (!fileExtension(file)) {
    return "Extension d’image non reconnue.";
  }

  return null;
}

export function generatedArtPath(
  userId: string,
  extension: (typeof ALLOWED_IMAGE_EXTENSIONS)[number] = "webp",
  id = crypto.randomUUID(),
) {
  if (!userId || userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
    throw new Error("Identifiant utilisateur invalide.");
  }

  const normalized = extension === "jpeg" ? "jpg" : extension;
  return `${userId}/${id}.${normalized}`;
}

export function validateGeneratedImageBytes(bytes: Uint8Array, contentType: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Le format généré n’est pas pris en charge.";
  }

  if (bytes.byteLength === 0) {
    return "L’image générée est vide.";
  }

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return "L’image générée dépasse 5 Mo.";
  }

  return null;
}

export function cardArtPath(userId: string, file: File) {
  const extension = fileExtension(file);
  return generatedArtPath(userId, extension ?? "webp");
}

export { CARD_BUCKET };
