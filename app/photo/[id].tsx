import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { ActionButtons } from "../../src/components/detail/ActionButtons";
import { LocationMap } from "../../src/components/detail/LocationMap";
import { PlaylistBottomSheet } from "../../src/components/detail/PlaylistBottomSheet";
import { usePhotoContext } from "../../src/context/PhotoContext";
import {
  mapAssetInfoToPhotoInfo,
  type PhotoAssetInfo,
} from "../../src/types/photo";
import { COLORS } from "../../src/utils/constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DISMISS_THRESHOLD = 150;

// Main component
export default function PhotoDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPhoto, thumbnailPosition } = usePhotoContext();

  const imageHeight = selectedPhoto
    ? SCREEN_WIDTH / (selectedPhoto.width / selectedPhoto.height)
    : SCREEN_WIDTH;

  const [assetInfo, setAssetInfo] = useState<PhotoAssetInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showPlaylistSheet, setShowPlaylistSheet] = useState(false);
  const isMapTouchedRef = useRef(false);

  const handleSavePress = useCallback(() => {
    setShowPlaylistSheet(true);
  }, []);

  const handleClosePlaylistSheet = useCallback(() => {
    setShowPlaylistSheet(false);
  }, []);

  const handleMapTouchStart = useCallback(() => {
    isMapTouchedRef.current = true;
  }, []);

  const handleMapTouchEnd = useCallback(() => {
    isMapTouchedRef.current = false;
  }, []);

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
        setIsLoadingLocation(false);
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
        !isMapTouchedRef.current &&
        gestureState.dy > 10 &&
        Math.abs(gestureState.dx) < 30,
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

            <ActionButtons
              onSavePress={handleSavePress}
              photoId={selectedPhoto.id}
            />

            <View style={styles.metadataSection}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>찍은 시간</Text>
                <Text style={styles.metadataValue}>
                  {selectedPhoto.creationTime
                    ? new Date(selectedPhoto.creationTime).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "알 수 없음"}
                </Text>
              </View>

              {isLoadingLocation ? (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>촬영 위치</Text>
                  <View style={styles.loadingLocation}>
                    <ActivityIndicator
                      color={COLORS.textSecondary}
                      size="small"
                    />
                  </View>
                </View>
              ) : null}

              {!isLoadingLocation &&
              (selectedPhoto.location || assetInfo?.exif?.gpsLatitude) ? (
                <LocationMap
                  latitude={
                    selectedPhoto.location?.latitude ??
                    assetInfo?.exif?.gpsLatitude ??
                    0
                  }
                  longitude={
                    selectedPhoto.location?.longitude ??
                    assetInfo?.exif?.gpsLongitude ??
                    0
                  }
                  onTouchEnd={handleMapTouchEnd}
                  onTouchStart={handleMapTouchStart}
                />
              ) : null}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      <PlaylistBottomSheet
        onClose={handleClosePlaylistSheet}
        photoId={selectedPhoto.id}
        visible={showPlaylistSheet}
      />
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
    marginBottom: 8,
  },
  metadataSection: {
    backgroundColor: COLORS.background,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metadataValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  locationContainer: {
    marginTop: 16,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  loadingLocation: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },
});
