import { useRouter } from "expo-router";
import { memo, useCallback, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { usePhotoContext } from "../../context/PhotoContext";
import type { FeedPhoto } from "../../types/photo";
import { SIZES } from "../../utils/constants";
import { MetadataSection } from "./MetadataSection";
import { PhotoThumbnail } from "./PhotoThumbnail";

type FeedItemProps = {
  photo: FeedPhoto;
};

function FeedItemComponent({ photo }: FeedItemProps) {
  const router = useRouter();
  const { setSelectedPhoto, setThumbnailPosition } = usePhotoContext();
  const thumbnailRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    if (thumbnailRef.current) {
      thumbnailRef.current.measureInWindow((x, y, width, height) => {
        setThumbnailPosition({ x, y, width, height, pageY: y });
        setSelectedPhoto(photo);
        router.push(`/photo/${encodeURIComponent(photo.id)}`);
      });
    }
  }, [photo, router, setSelectedPhoto, setThumbnailPosition]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View collapsable={false} ref={thumbnailRef}>
        <PhotoThumbnail
          height={photo.height}
          uri={photo.uri}
          width={photo.width}
        />
      </View>
      <View style={styles.metadataContainer}>
        <MetadataSection timeAgo={photo.timeAgo} title={photo.title} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  metadataContainer: {
    paddingHorizontal: SIZES.horizontalPadding,
  },
});

export const FeedItem = memo(FeedItemComponent);
