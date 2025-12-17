import { Image } from "expo-image";
import { memo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { COLORS, SIZES } from "../../utils/constants";

type PhotoThumbnailProps = {
  uri: string;
};

function PhotoThumbnailComponent({ uri }: PhotoThumbnailProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth;
  const containerHeight = containerWidth / SIZES.thumbnailAspectRatio;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: isLoaded ? COLORS.letterbox : COLORS.skeleton,
        },
      ]}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoad={() => setIsLoaded(true)}
        source={{ uri }}
        style={styles.image}
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  image: {
    width: "100%",
    height: "100%",
  },
});

export const PhotoThumbnail = memo(PhotoThumbnailComponent);
