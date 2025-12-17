import type * as MediaLibrary from "expo-media-library";

export type PhotoAsset = {
  id: string;
  uri: string;
  filename: string;
  width: number;
  height: number;
  creationTime: number | null;
  modificationTime: number | null;
  location: PhotoLocation | null;
};

export type PhotoLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
};

export type FeedPhoto = PhotoAsset & {
  title: string;
  timeAgo: string;
};

export type PermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "limited";

export function mapAssetToPhoto(
  asset: MediaLibrary.Asset | MediaLibrary.AssetInfo
): PhotoAsset {
  const location =
    "location" in asset && asset.location
      ? {
          latitude: asset.location.latitude,
          longitude: asset.location.longitude,
        }
      : null;

  return {
    id: asset.id,
    uri: asset.uri,
    filename: asset.filename,
    width: asset.width,
    height: asset.height,
    creationTime: asset.creationTime ?? null,
    modificationTime: asset.modificationTime ?? null,
    location,
  };
}
