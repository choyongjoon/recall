import * as MediaLibrary from "expo-media-library";
import { mapAssetToPhoto, type PhotoAsset } from "../types/photo";

const PAGE_SIZE = 500; // Fetch IDs in large batches for efficiency

/**
 * Fetches all photo asset IDs from the media library
 */
export async function fetchAllPhotoIds(): Promise<string[]> {
  const ids: string[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: PAGE_SIZE,
      after: endCursor,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    for (const asset of result.assets) {
      ids.push(asset.id);
    }

    hasNextPage = result.hasNextPage;
    endCursor = result.endCursor;
  }

  return ids;
}

/**
 * Fetches photo assets by their IDs
 */
export async function fetchPhotosByIds(ids: string[]): Promise<PhotoAsset[]> {
  if (ids.length === 0) {
    return [];
  }

  const photos: PhotoAsset[] = [];

  for (const id of ids) {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(id);
      if (asset) {
        photos.push(mapAssetToPhoto(asset));
      }
    } catch (error) {
      console.warn(`Failed to fetch asset ${id}:`, error);
    }
  }

  return photos;
}

/**
 * Request media library permissions
 */
export async function requestPermissions(): Promise<MediaLibrary.PermissionResponse> {
  return MediaLibrary.requestPermissionsAsync();
}

/**
 * Get current media library permission status
 */
export async function getPermissions(): Promise<MediaLibrary.PermissionResponse> {
  return MediaLibrary.getPermissionsAsync();
}
