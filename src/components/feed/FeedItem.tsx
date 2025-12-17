import { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { FeedPhoto } from "../../types/photo";
import { SIZES } from "../../utils/constants";
import { MetadataSection } from "./MetadataSection";
import { PhotoThumbnail } from "./PhotoThumbnail";

interface FeedItemProps {
  photo: FeedPhoto;
}

function FeedItemComponent({ photo }: FeedItemProps) {
  return (
    <View style={styles.container}>
      <PhotoThumbnail uri={photo.uri} />
      <MetadataSection timeAgo={photo.timeAgo} title={photo.title} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.horizontalPadding,
    paddingBottom: SIZES.itemSpacing,
  },
});

export const FeedItem = memo(FeedItemComponent);
