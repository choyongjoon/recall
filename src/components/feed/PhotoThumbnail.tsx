import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { COLORS, SIZES } from "../../utils/constants";

interface PhotoThumbnailProps {
  uri: string;
}

function PhotoThumbnailComponent({ uri }: PhotoThumbnailProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - SIZES.horizontalPadding * 2;
  const containerHeight = containerWidth / SIZES.thumbnailAspectRatio;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
        },
      ]}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        source={{ uri }}
        style={styles.image}
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.letterbox,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export const PhotoThumbnail = memo(PhotoThumbnailComponent);
