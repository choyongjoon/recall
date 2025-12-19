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

export type PhotoExif = {
  // Camera info
  make?: string;
  model?: string;
  lensModel?: string;
  // Capture settings
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  focalLengthIn35mm?: number;
  // Flash & lighting
  flash?: number;
  whiteBalance?: number;
  // Image info
  colorSpace?: string;
  orientation?: number;
  // Software
  software?: string;
  // Date
  dateTimeOriginal?: string;
  // GPS (sometimes in EXIF)
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
};

export type PhotoAssetInfo = PhotoAsset & {
  localUri?: string;
  exif?: PhotoExif;
  isFavorite?: boolean;
  orientation?: number;
  duration?: number;
  mediaSubtypes?: string[];
};

export type FeedPhoto = PhotoAsset & {
  title: string;
  timeAgo: string;
};

export function isPortraitPhoto(photo: PhotoAsset): boolean {
  return photo.height > photo.width;
}

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

export function mapAssetInfoToPhotoInfo(
  assetInfo: MediaLibrary.AssetInfo
): PhotoAssetInfo {
  const location = assetInfo.location
    ? {
        latitude: assetInfo.location.latitude,
        longitude: assetInfo.location.longitude,
      }
    : null;

  // Map EXIF data - iOS nests data under {Exif}, {TIFF}, {GPS} keys
  const rawExif = assetInfo.exif as Record<string, unknown> | undefined;

  // Extract nested sections (iOS format)
  const exifSection = rawExif?.["{Exif}"] as
    | Record<string, unknown>
    | undefined;
  const tiffSection = rawExif?.["{TIFF}"] as
    | Record<string, unknown>
    | undefined;
  const gpsSection = rawExif?.["{GPS}"] as Record<string, unknown> | undefined;

  // Get ISO - can be array or number
  const isoRaw = exifSection?.ISOSpeedRatings;
  const iso = Array.isArray(isoRaw) ? isoRaw[0] : isoRaw;

  const exif: PhotoExif | undefined = rawExif
    ? {
        // From {TIFF}
        make: tiffSection?.Make as string | undefined,
        model: tiffSection?.Model as string | undefined,
        software: tiffSection?.Software as string | undefined,
        orientation: (tiffSection?.Orientation ?? rawExif?.Orientation) as
          | number
          | undefined,

        // From {Exif}
        lensModel: exifSection?.LensModel as string | undefined,
        fNumber: exifSection?.FNumber as number | undefined,
        exposureTime: exifSection?.ExposureTime as number | undefined,
        iso: iso as number | undefined,
        focalLength: exifSection?.FocalLength as number | undefined,
        focalLengthIn35mm: exifSection?.FocalLenIn35mmFilm as
          | number
          | undefined,
        flash: exifSection?.Flash as number | undefined,
        whiteBalance: exifSection?.WhiteBalance as number | undefined,
        colorSpace: rawExif?.ColorModel as string | undefined,
        dateTimeOriginal: exifSection?.DateTimeOriginal as string | undefined,

        // From {GPS}
        gpsLatitude: gpsSection?.Latitude as number | undefined,
        gpsLongitude: gpsSection?.Longitude as number | undefined,
        gpsAltitude: gpsSection?.Altitude as number | undefined,
      }
    : undefined;

  return {
    id: assetInfo.id,
    uri: assetInfo.uri,
    filename: assetInfo.filename,
    width: assetInfo.width,
    height: assetInfo.height,
    creationTime: assetInfo.creationTime ?? null,
    modificationTime: assetInfo.modificationTime ?? null,
    location,
    localUri: assetInfo.localUri,
    exif,
    isFavorite: assetInfo.isFavorite,
    orientation: assetInfo.orientation,
    duration: assetInfo.duration,
    mediaSubtypes: assetInfo.mediaSubtypes,
  };
}
