import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePhotoContext } from "../../src/context/PhotoContext";
import {
  mapAssetInfoToPhotoInfo,
  type PhotoAssetInfo,
} from "../../src/types/photo";
import { COLORS } from "../../src/utils/constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DISMISS_THRESHOLD = 150;

export default function PhotoDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPhoto, thumbnailPosition } = usePhotoContext();

  // Calculate image height based on original aspect ratio
  const imageHeight = selectedPhoto
    ? SCREEN_WIDTH / (selectedPhoto.width / selectedPhoto.height)
    : SCREEN_WIDTH;

  // Full asset info with EXIF
  const [assetInfo, setAssetInfo] = useState<PhotoAssetInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  // Fetch full asset info on mount
  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const fetchAssetInfo = async () => {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(selectedPhoto.id);
        setAssetInfo(mapAssetInfoToPhotoInfo(info));
      } catch (error) {
        console.error("Failed to fetch asset info:", error);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchAssetInfo();
  }, [selectedPhoto]);

  // Calculate starting position (from thumbnail) and target (top of screen below safe area)
  const getStartPosition = () => {
    if (!thumbnailPosition) {
      return { x: 0, y: SCREEN_HEIGHT / 2, scale: 0.5 };
    }
    const startScale = thumbnailPosition.width / SCREEN_WIDTH;
    const startX =
      thumbnailPosition.x - (SCREEN_WIDTH - thumbnailPosition.width) / 2;
    const startY =
      thumbnailPosition.pageY -
      insets.top -
      (imageHeight * startScale - thumbnailPosition.height) / 2;
    return { x: startX, y: startY, scale: startScale };
  };

  const startPos = getStartPosition();

  // Animation values - start from thumbnail position
  const imageTranslateX = useRef(new Animated.Value(startPos.x)).current;
  const imageTranslateY = useRef(new Animated.Value(startPos.y)).current;
  const imageScale = useRef(new Animated.Value(startPos.scale)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // For drag gesture
  const dragTranslateY = useRef(new Animated.Value(0)).current;

  // Details slide up from below
  const detailsTranslateY = useRef(new Animated.Value(300)).current;

  // Entry animation - thumbnail moves to top, details slide up from below
  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(imageTranslateX, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(imageTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(detailsTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(detailsOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    backdropOpacity,
    detailsOpacity,
    detailsTranslateY,
    imageTranslateX,
    imageTranslateY,
    imageScale,
  ]);

  const handleDismiss = () => {
    // Target: bottom right corner, small thumbnail
    const targetX = SCREEN_WIDTH * 0.3;
    const targetY = SCREEN_HEIGHT - insets.top - imageHeight * 0.5;
    const targetScale = 0.2;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(detailsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateX, {
        toValue: targetX,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateY, {
        toValue: targetY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: targetScale,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dx) < 30,
      onPanResponderGrant: () => {
        dragTranslateY.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragTranslateY.setValue(gestureState.dy);
          const progress = Math.min(gestureState.dy / DISMISS_THRESHOLD, 1);
          detailsOpacity.setValue(1 - progress);
          backdropOpacity.setValue(1 - progress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        dragTranslateY.flattenOffset();
        if (gestureState.dy > DISMISS_THRESHOLD) {
          handleDismiss();
        } else {
          Animated.parallel([
            Animated.spring(dragTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 12,
            }),
            Animated.timing(detailsOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!selectedPhoto) {
    return null;
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExposureTime = (time: number) => {
    if (time >= 1) return `${time}s`;
    return `1/${Math.round(1 / time)}s`;
  };

  const formatFlash = (flash: number) => {
    // EXIF flash values
    if (flash === 0) return "No Flash";
    if (flash & 1) return "Flash Fired";
    return "No Flash";
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            transform: [{ translateY: dragTranslateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.imageContainer,
            {
              height: imageHeight,
              transform: [
                { translateX: imageTranslateX },
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            },
          ]}
        >
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: selectedPhoto.uri }}
            style={styles.image}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.details,
            {
              opacity: detailsOpacity,
              transform: [{ translateY: detailsTranslateY }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <Text style={styles.title}>{selectedPhoto.title}</Text>
            <Text style={styles.timeAgo}>{selectedPhoto.timeAgo}</Text>

            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>Details</Text>

              <MetadataRow label="Filename" value={selectedPhoto.filename} />
              <MetadataRow
                label="Created"
                value={formatDate(selectedPhoto.creationTime)}
              />
              <MetadataRow
                label="Modified"
                value={formatDate(selectedPhoto.modificationTime)}
              />
              <MetadataRow
                label="Dimensions"
                value={`${selectedPhoto.width} x ${selectedPhoto.height}`}
              />
              <MetadataRow
                label="Aspect Ratio"
                value={(selectedPhoto.width / selectedPhoto.height).toFixed(2)}
              />
              {assetInfo?.isFavorite !== undefined && (
                <MetadataRow
                  label="Favorite"
                  value={assetInfo.isFavorite ? "Yes" : "No"}
                />
              )}

              {/* Camera & EXIF Section */}
              {isLoadingInfo ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator
                    color={COLORS.textSecondary}
                    size="small"
                  />
                  <Text style={styles.loadingText}>Loading EXIF data...</Text>
                </View>
              ) : (
                assetInfo?.exif && (
                  <>
                    <Text style={[styles.sectionTitle, styles.newSection]}>
                      Camera
                    </Text>
                    {assetInfo.exif.make && (
                      <MetadataRow label="Make" value={assetInfo.exif.make} />
                    )}
                    {assetInfo.exif.model && (
                      <MetadataRow label="Model" value={assetInfo.exif.model} />
                    )}
                    {assetInfo.exif.lensModel && (
                      <MetadataRow
                        label="Lens"
                        value={assetInfo.exif.lensModel}
                      />
                    )}
                    {assetInfo.exif.software && (
                      <MetadataRow
                        label="Software"
                        value={assetInfo.exif.software}
                      />
                    )}

                    {(assetInfo.exif.fNumber ||
                      assetInfo.exif.exposureTime ||
                      assetInfo.exif.iso ||
                      assetInfo.exif.focalLength) && (
                      <>
                        <Text style={[styles.sectionTitle, styles.newSection]}>
                          Capture Settings
                        </Text>
                        {assetInfo.exif.fNumber && (
                          <MetadataRow
                            label="Aperture"
                            value={`f/${assetInfo.exif.fNumber}`}
                          />
                        )}
                        {assetInfo.exif.exposureTime && (
                          <MetadataRow
                            label="Shutter Speed"
                            value={formatExposureTime(
                              assetInfo.exif.exposureTime
                            )}
                          />
                        )}
                        {assetInfo.exif.iso && (
                          <MetadataRow
                            label="ISO"
                            value={String(assetInfo.exif.iso)}
                          />
                        )}
                        {assetInfo.exif.focalLength && (
                          <MetadataRow
                            label="Focal Length"
                            value={`${assetInfo.exif.focalLength}mm${
                              assetInfo.exif.focalLengthIn35mm
                                ? ` (${assetInfo.exif.focalLengthIn35mm}mm equiv)`
                                : ""
                            }`}
                          />
                        )}
                        {assetInfo.exif.flash !== undefined && (
                          <MetadataRow
                            label="Flash"
                            value={formatFlash(assetInfo.exif.flash)}
                          />
                        )}
                        {assetInfo.exif.whiteBalance !== undefined && (
                          <MetadataRow
                            label="White Balance"
                            value={
                              assetInfo.exif.whiteBalance === 0
                                ? "Auto"
                                : "Manual"
                            }
                          />
                        )}
                      </>
                    )}
                  </>
                )
              )}

              {/* Location Section */}
              {(selectedPhoto.location || assetInfo?.exif?.gpsLatitude) && (
                <>
                  <Text style={[styles.sectionTitle, styles.newSection]}>
                    Location
                  </Text>
                  <MetadataRow
                    label="Latitude"
                    value={(
                      selectedPhoto.location?.latitude ??
                      assetInfo?.exif?.gpsLatitude ??
                      0
                    ).toFixed(6)}
                  />
                  <MetadataRow
                    label="Longitude"
                    value={(
                      selectedPhoto.location?.longitude ??
                      assetInfo?.exif?.gpsLongitude ??
                      0
                    ).toFixed(6)}
                  />
                  {assetInfo?.exif?.gpsAltitude && (
                    <MetadataRow
                      label="Altitude"
                      value={`${assetInfo.exif.gpsAltitude.toFixed(1)}m`}
                    />
                  )}
                  {selectedPhoto.location?.city && (
                    <MetadataRow
                      label="City"
                      value={selectedPhoto.location.city}
                    />
                  )}
                  {selectedPhoto.location?.country && (
                    <MetadataRow
                      label="Country"
                      value={selectedPhoto.location.country}
                    />
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metadataRow}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  details: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  metadataSection: {
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  newSection: {
    marginTop: 24,
  },
  loadingSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  metadataLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: "right",
  },
});
