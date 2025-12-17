import { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { FeedPhoto } from "../../types/photo";
import { SIZES } from "../../utils/constants";
import { MetadataSection } from "./MetadataSection";
import { PhotoThumbnail } from "./PhotoThumbnail";

type FeedItemProps = {
  photo: FeedPhoto;
};

function FeedItemComponent({ photo }: FeedItemProps) {
  return (
    <View style={styles.container}>
      <PhotoThumbnail uri={photo.uri} />
      <View style={styles.metadataContainer}>
        <MetadataSection timeAgo={photo.timeAgo} title={photo.title} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SIZES.itemSpacing,
  },
  metadataContainer: {
    paddingHorizontal: SIZES.horizontalPadding,
  },
});

export const FeedItem = memo(FeedItemComponent);
