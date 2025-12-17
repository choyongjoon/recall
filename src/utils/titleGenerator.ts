import type { PhotoAsset } from "../types/photo";
import { formatDateForTitle } from "./formatters";

const FILE_EXTENSION_REGEX = /\.[^/.]+$/;

export function generatePhotoTitle(photo: PhotoAsset): string {
  const { creationTime, location, filename } = photo;

  // Priority 1: Location + Date
  if (location && creationTime) {
    const dateStr = formatDateForTitle(creationTime);
    // Note: expo-media-library provides lat/lng but not city/country names
    // For MVP, we'll just use date since reverse geocoding would require additional API
    return dateStr;
  }

  // Priority 2: Date only
  if (creationTime) {
    return formatDateForTitle(creationTime);
  }

  // Priority 3: Filename (remove extension)
  if (filename) {
    const nameWithoutExt = filename.replace(FILE_EXTENSION_REGEX, "");
    if (nameWithoutExt && nameWithoutExt.length > 0) {
      return nameWithoutExt;
    }
  }

  // Priority 4: Fallback
  return "무제";
}
