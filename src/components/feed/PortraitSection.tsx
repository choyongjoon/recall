import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useCallback, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePhotoContext } from "../../context/PhotoContext";
import type { FeedPhoto } from "../../types/photo";
import { SIZES } from "../../utils/constants";

const COLUMN_COUNT = 2;
const MAX_ROWS = 3;
const MAX_ITEMS = COLUMN_COUNT * MAX_ROWS;
const ASPECT_RATIO = 27 / 40;
const GAP = 8;
const BORDER_RADIUS = 8;

type PortraitSectionProps = {
  photos: FeedPhoto[];
};

type PortraitThumbnailProps = {
  photo: FeedPhoto;
  width: number;
  height: number;
};

function PortraitThumbnail({ photo, width, height }: PortraitThumbnailProps) {
  const router = useRouter();
  const { setSelectedPhoto, setThumbnailPosition } = usePhotoContext();
  const thumbnailRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    if (thumbnailRef.current) {
      thumbnailRef.current.measureInWindow((x, y, w, h) => {
        setThumbnailPosition({ x, y, width: w, height: h, pageY: y });
        setSelectedPhoto(photo);
        router.push(`/photo/${encodeURIComponent(photo.id)}`);
      });
    }
  }, [photo, router, setSelectedPhoto, setThumbnailPosition]);

  return (
    <Pressable onPress={handlePress}>
      <View
        collapsable={false}
        ref={thumbnailRef}
        style={[styles.thumbnailContainer, { width, height }]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={photo.id}
          source={{ uri: photo.uri }}
          style={styles.image}
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.overlay}
        >
          <View style={styles.textContainer}>
            <Text numberOfLines={2} style={styles.title}>
              {photo.title}
            </Text>
            <Text style={styles.timeAgo}>{photo.timeAgo}</Text>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function PortraitSectionComponent({ photos }: PortraitSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const displayPhotos = photos.slice(0, MAX_ITEMS);

  if (displayPhotos.length === 0) {
    return null;
  }

  const containerPadding = SIZES.horizontalPadding;
  const availableWidth = screenWidth - containerPadding * 2;
  const itemWidth = (availableWidth - GAP) / COLUMN_COUNT;
  const itemHeight = itemWidth / ASPECT_RATIO;

  // Create rows of 2 items each
  const rows: FeedPhoto[][] = [];
  for (let i = 0; i < displayPhotos.length; i += COLUMN_COUNT) {
    rows.push(displayPhotos.slice(i, i + COLUMN_COUNT));
  }

  return (
    <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.map((p) => p.id).join("-")} style={styles.row}>
            {row.map((photo) => (
              <PortraitThumbnail
                height={itemHeight}
                key={photo.id}
                photo={photo}
                width={itemWidth}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  grid: {
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  thumbnailContainer: {
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeAgo: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export const PortraitSection = memo(PortraitSectionComponent);
