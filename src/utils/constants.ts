export const COLORS = {
  background: "#FFFFFF",
  letterbox: "#000000",
  avatarBackground: "#E0E0E0",
  textPrimary: "#030303",
  textSecondary: "#606060",
  separator: "#E5E5E5",
} as const;

export const SIZES = {
  thumbnailAspectRatio: 16 / 9,
  avatarSize: 36,
  horizontalPadding: 8,
  itemSpacing: 16,
  thumbnailMetadataGap: 12,
  titleFontSize: 14,
  timeFontSize: 12,
  titleMaxLines: 2,
} as const;

export const FEED = {
  batchSize: 10,
  preloadThreshold: 0.5,
  initialNumToRender: 5,
  maxToRenderPerBatch: 5,
} as const;
