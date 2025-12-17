import * as MediaLibrary from "expo-media-library";
import { mapAssetToPhoto, type PhotoAsset } from "../types/photo";

const PAGE_SIZE = 500;

/**
 * Fetches all photo assets from the media library
 * Uses getAssetsAsync which returns basic asset info including URI (fast)
 */
export async function fetchAllPhotos(
  onProgress?: (loaded: number, total: number | null) => void
): Promise<PhotoAsset[]> {
  const startTime = Date.now();
  console.log("[PERF] fetchAllPhotos: started");

  const photos: PhotoAsset[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;
  let pageCount = 0;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: PAGE_SIZE,
      after: endCursor,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    pageCount += 1;

    for (const asset of result.assets) {
      photos.push(mapAssetToPhoto(asset));
    }

    // Report progress
    if (onProgress) {
      onProgress(photos.length, result.hasNextPage ? null : photos.length);
    }

    hasNextPage = result.hasNextPage;
    endCursor = result.endCursor;

    // Log every 10 pages
    if (pageCount % 10 === 0) {
      console.log(`[PERF] fetchAllPhotos: loaded ${photos.length} photos...`);
    }
  }

  console.log(
    `[PERF] fetchAllPhotos: completed ${photos.length} photos in ${Date.now() - startTime}ms`
  );
  return photos;
}

/**
 * Request media library permissions
 */
export function requestPermissions(): Promise<MediaLibrary.PermissionResponse> {
  return MediaLibrary.requestPermissionsAsync();
}

/**
 * Get current media library permission status
 */
export function getPermissions(): Promise<MediaLibrary.PermissionResponse> {
  return MediaLibrary.getPermissionsAsync();
}
