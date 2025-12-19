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
  type PhotoExif,
} from "../../src/types/photo";
import { COLORS } from "../../src/utils/constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DISMISS_THRESHOLD = 150;

// Helper functions
function formatDate(timestamp: number | null): string {
  if (!timestamp) {
    return "Unknown";
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatExposureTime(time: number): string {
  if (time >= 1) {
    return `${time}s`;
  }
  return `1/${Math.round(1 / time)}s`;
}

function formatFlash(flash: number): string {
  if (flash === 0) {
    return "No Flash";
  }
  // biome-ignore lint/suspicious/noBitwiseOperators: EXIF flash field uses bitwise flags
  if (flash & 1) {
    return "Flash Fired";
  }
  return "No Flash";
}

// Sub-components
function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metadataRow}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

function CameraSection({ exif }: { exif: PhotoExif }) {
  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>Camera</Text>
      {exif.make ? <MetadataRow label="Make" value={exif.make} /> : null}
      {exif.model ? <MetadataRow label="Model" value={exif.model} /> : null}
      {exif.lensModel ? (
        <MetadataRow label="Lens" value={exif.lensModel} />
      ) : null}
      {exif.software ? (
        <MetadataRow label="Software" value={exif.software} />
      ) : null}
    </>
  );
}

function CaptureSettingsSection({ exif }: { exif: PhotoExif }) {
  const hasSettings =
    exif.fNumber || exif.exposureTime || exif.iso || exif.focalLength;

  if (!hasSettings) {
    return null;
  }

  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>
        Capture Settings
      </Text>
      {exif.fNumber ? (
        <MetadataRow label="Aperture" value={`f/${exif.fNumber}`} />
      ) : null}
      {exif.exposureTime ? (
        <MetadataRow
          label="Shutter Speed"
          value={formatExposureTime(exif.exposureTime)}
        />
      ) : null}
      {exif.iso ? <MetadataRow label="ISO" value={String(exif.iso)} /> : null}
      {exif.focalLength ? (
        <MetadataRow
          label="Focal Length"
          value={`${exif.focalLength}mm${
            exif.focalLengthIn35mm ? ` (${exif.focalLengthIn35mm}mm equiv)` : ""
          }`}
        />
      ) : null}
      {exif.flash !== undefined ? (
        <MetadataRow label="Flash" value={formatFlash(exif.flash)} />
      ) : null}
      {exif.whiteBalance !== undefined ? (
        <MetadataRow
          label="White Balance"
          value={exif.whiteBalance === 0 ? "Auto" : "Manual"}
        />
      ) : null}
    </>
  );
}

type LocationSectionProps = {
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  } | null;
  exif?: PhotoExif;
};

function LocationSection({ location, exif }: LocationSectionProps) {
  const hasLocation = location || exif?.gpsLatitude;

  if (!hasLocation) {
    return null;
  }

  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>Location</Text>
      <MetadataRow
        label="Latitude"
        value={(location?.latitude ?? exif?.gpsLatitude ?? 0).toFixed(6)}
      />
      <MetadataRow
        label="Longitude"
        value={(location?.longitude ?? exif?.gpsLongitude ?? 0).toFixed(6)}
      />
      {exif?.gpsAltitude ? (
        <MetadataRow
          label="Altitude"
          value={`${exif.gpsAltitude.toFixed(1)}m`}
        />
      ) : null}
      {location?.city ? (
        <MetadataRow label="City" value={location.city} />
      ) : null}
      {location?.country ? (
        <MetadataRow label="Country" value={location.country} />
      ) : null}
    </>
  );
}

// Main component
export default function PhotoDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPhoto, thumbnailPosition } = usePhotoContext();

  const imageHeight = selectedPhoto
    ? SCREEN_WIDTH / (selectedPhoto.width / selectedPhoto.height)
    : SCREEN_WIDTH;

  const [assetInfo, setAssetInfo] = useState<PhotoAssetInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

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

  const imageTranslateX = useRef(new Animated.Value(startPos.x)).current;
  const imageTranslateY = useRef(new Animated.Value(startPos.y)).current;
  const imageScale = useRef(new Animated.Value(startPos.scale)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragTranslateY = useRef(new Animated.Value(0)).current;
  const detailsTranslateY = useRef(new Animated.Value(300)).current;

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
              {assetInfo?.isFavorite !== undefined ? (
                <MetadataRow
                  label="Favorite"
                  value={assetInfo.isFavorite ? "Yes" : "No"}
                />
              ) : null}

              {isLoadingInfo ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator
                    color={COLORS.textSecondary}
                    size="small"
                  />
                  <Text style={styles.loadingText}>Loading EXIF data...</Text>
                </View>
              ) : null}

              {!isLoadingInfo && assetInfo?.exif ? (
                <>
                  <CameraSection exif={assetInfo.exif} />
                  <CaptureSettingsSection exif={assetInfo.exif} />
                </>
              ) : null}

              <LocationSection
                exif={assetInfo?.exif}
                location={selectedPhoto.location}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
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
