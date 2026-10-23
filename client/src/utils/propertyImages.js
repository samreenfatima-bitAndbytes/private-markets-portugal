import { mediaUrl } from "./mediaUrl";

/**
 * Build displayable image URLs for a property.
 * Prefers static paths in `image` / path-like `propertyImgId` (demo mode).
 */
export function propertyImageUrls(property) {
  const ids = property?.propertyImgId || [];
  const types = property?.fileType || [];
  const urls = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (!id) continue;
    const type = types[i] || "image/jpeg";
    if (String(type).includes("pdf")) continue;
    urls.push(mediaUrl(id, "/property.jpg"));
  }
  if (!urls.length && property?.image?.length) {
    for (const img of property.image) {
      if (img) urls.push(mediaUrl(String(img).replace(/"/g, ""), "/property.jpg"));
    }
  }
  return urls;
}

export function propertyThumbUrl(property) {
  return propertyImageUrls(property)[0] || "/property.jpg";
}

export const PROPERTY_IMG_FALLBACK = "/property.jpg";
