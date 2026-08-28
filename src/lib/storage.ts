import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  CARD_BUCKET,
  MAX_IMAGE_BYTES,
} from "@/lib/constants";

export function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_IMAGE_EXTENSIONS.includes(fromName as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
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

export function cardArtPath(userId: string, file: File) {
  const extension = fileExtension(file);
  return `${userId}/${crypto.randomUUID()}.${extension}`;
}

export { CARD_BUCKET };
